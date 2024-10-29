import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsEntity } from 'src/database/entities';
import { promisify } from 'util';
import * as fs from 'fs';
import {
  ProcessResult,
  WgKeys,
  WgServerInterface,
  WgServerPeer,
} from 'src/types';
import { Repository } from 'typeorm';
import { ServerConfBuilder } from 'src/conf';
import { exec } from 'child_process';
import { TunnelService } from 'src/tunnel/tunnel.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Wg0configService implements OnModuleInit {
  WG0_PATH = '/etc/wireguard/wg0.conf';

  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
    @Inject(forwardRef(() => TunnelService))
    private readonly tunnelService: TunnelService,
  ) {}

  async onModuleInit() {
    await this.writeDefaultwg0();
    await this.up();
    await this.restorePeers();
  }

  async getOrCreateKeys(): Promise<WgKeys> {
    const settings = await this.settingsRepository.find({});
    let [privateKey, publicKey] = [
      settings.filter((data) => data.key == 'privateKey').at(0)?.value,
      settings.filter((data) => data.key == 'publicKey').at(0)?.value,
    ];

    if (!privateKey || !publicKey) {
      const keys = await this.genKeys();
      publicKey = keys.publicKey;
      privateKey = keys.privateKey;

      await this.settingsRepository.save([
        { key: 'privateKey', value: privateKey },
        { key: 'publicKey', value: publicKey },
      ]);
    }

    return {
      privateKey,
      publicKey,
    };
  }

  async restorePeers(): Promise<void> {
    let limit = 10;
    let offset = 0;

    while (true) {
      const tunnels = await this.tunnelService.getMany(limit, offset);
      if (!tunnels.length) return;
      for (const tunnel of tunnels) {
        await this.addPeer(tunnel);
      }
      offset += limit;
    }
  }

  async writeDefaultwg0() {
    const configExists = await promisify(fs.exists)(this.WG0_PATH);
    if (configExists) return;

    const keys = await this.getOrCreateKeys();
    const eth0 = process.env.eth0Interface;
    const serverInterface: WgServerInterface = {
      keys,
      ipAddress: process.env.ipAddress,
      address: '10.0.0.1/24',
      listenPort: process.env.listenPort,
      preUp: [],
      postUp: [
        `iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ${eth0} -j MASQUERADE`,
      ],
      preDown: [],
      postDown: [
        `iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ${eth0} -j MASQUERADE`,
      ],
    };

    await promisify(fs.writeFile)(
      this.WG0_PATH,
      new ServerConfBuilder().interface(serverInterface).build(),
    );
  }

  runCommand(command: string): Promise<ProcessResult> {
    return promisify(exec)(command);
  }

  async runCommandOrThrow(command: string): Promise<ProcessResult> {
    const result = await this.runCommand(command);
    if (result.stderr) {
      //throw new CliError(result);
    }
    return result;
  }

  up(): Promise<ProcessResult> {
    return this.runCommandOrThrow('wg-quick up wg0');
  }

  down(): Promise<ProcessResult> {
    return this.runCommandOrThrow('wg-quick down wg0');
  }

  async genKeys(): Promise<WgKeys> {
    const postProccess = (result: ProcessResult) => result.stdout.trim();

    const privateKey =
      await this.runCommandOrThrow('wg genkey').then(postProccess);

    const publicKey = await this.runCommandOrThrow(
      `echo ${privateKey} | wg genkey`,
    ).then(postProccess);

    return { publicKey, privateKey };
  }

  addPeer(peer: WgServerPeer): Promise<ProcessResult> {
    return this.runCommandOrThrow(
      `wg set wg0 peer ${peer.publicKey} allowed-ips ${peer.allowedIps}`,
    );
  }

  removePeer(publicKey: string): Promise<ProcessResult> {
    return this.runCommandOrThrow(`wg set wg0 peer ${publicKey} remove`);
  }

  sync() {
    return this.runCommandOrThrow('wg syncconf wg0 <(wg-quick strip wg0)');
  }
}
