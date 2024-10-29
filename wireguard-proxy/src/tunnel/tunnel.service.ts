import {
  forwardRef,
  Inject,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TunnelConfBuilder } from 'src/conf';
import { TunnelEntity } from 'src/database/entities';
import { Tunnel } from 'src/types';
import { Wg0configService } from 'src/wg0config/wg0config.service';
import { Repository } from 'typeorm';

function ipToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0);
}

function intToIp(int): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

function addToIp(ip: string, amount: number = 1): string {
  return intToIp(ipToInt(ip) + amount);
}

@Injectable()
export class TunnelService implements OnApplicationBootstrap {
  readonly START_IP = '10.0.0.2';

  constructor(
    @InjectRepository(TunnelEntity)
    private readonly tunnelRepository: Repository<TunnelEntity>,
    @Inject(forwardRef(() => Wg0configService))
    private readonly wg0configService: Wg0configService,
  ) {}

  async onApplicationBootstrap() {
    const tunnel = await this.createOne();
    console.log(await this.getConf(tunnel.publicKey));
  }

  async onModuleInit() {
    // create first tunnel with START_IP
    if ((await this.getCount()) == 0) {
      const tunnel: Tunnel = {
        ...(await this.wg0configService.genKeys()),
        allowedIps: await this.getNextIp(),
      };
      await this.tunnelRepository.save(tunnel);
    }
  }

  async getCount(): Promise<number> {
    return this.tunnelRepository.count({});
  }

  async getGapIp(): Promise<string> {
    return this.tunnelRepository
      .createQueryBuilder()
      .select('ips_lead.allowed_ips + 1', 'ip')
      .addSelect('ips_lead.next_nr - 1', 'end')
      .from((qb) => {
        return qb
          .subQuery()
          .select('peer.allowed_ips', 'allowed_ips')
          .addSelect(
            `LEAD(peer.allowed_ips) OVER (ORDER BY peer.allowed_ips)`,
            'next_nr',
          )
          .from(TunnelEntity, 'peer');
      }, 'ips_lead')
      .where('ips_lead.allowed_ips + 1 != ips_lead.next_nr')
      .limit(1)
      .getRawOne()
      .then((data) => {
        console.log(data);
        return data;
      })
      .then((data) => (!data ? null : data.ip));
  }

  async getMaxIp(): Promise<string | null> {
    return this.tunnelRepository
      .createQueryBuilder()
      .select('max(allowed_ips)')
      .limit(1)
      .getRawOne()
      .then((data) => data?.max);
  }

  async getNextIp() {
    const gapIp = await this.getGapIp();
    if (gapIp) return gapIp;
    const maxIp = await this.getMaxIp();
    if (maxIp) return addToIp(maxIp);
    return this.START_IP;
  }

  async createOne(): Promise<Tunnel> {
    const tunnel: Tunnel = {
      ...(await this.wg0configService.genKeys()),
      allowedIps: await this.getNextIp(),
    };
    await this.wg0configService.addPeer(tunnel);
    await this.tunnelRepository.save(tunnel);
    return tunnel;
  }

  getOne(publicKey: string): Promise<Tunnel> {
    return this.tunnelRepository.findOne({ where: { publicKey } });
  }

  getMany(limit: number = 20, offset: number = 0): Promise<Tunnel[]> {
    return this.tunnelRepository.find({
      take: limit,
      skip: offset,
      order: { id: 'DESC' },
    });
  }

  async deleteOne(publicKey: string): Promise<void> {
    this.wg0configService.removePeer(publicKey);
    this.tunnelRepository.delete({ publicKey });
  }

  async getConf(publicKey: string): Promise<string> {
    const { publicKey: peerPublicKey } =
      await this.wg0configService.getOrCreateKeys();
    const tunnel = await this.getOne(publicKey);
    return new TunnelConfBuilder()
      .interface({
        privateKey: tunnel.privateKey,
        address: `${tunnel.allowedIps}/32`,
        dns: '8.8.8.8',
      })
      .peer({
        publicKey: peerPublicKey,
        allowedIps: '0.0.0.0/0',
        ipAddress: process.env.ipAddress,
        listenPort: process.env.listenPort,
        persistentKeepalive: 20,
      })
      .build();
  }
}
