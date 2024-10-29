import { WgServerInterface, WgServerPeer } from 'src/types';
import { BaseConfBuilder } from './base-conf';

export class ServerConfBuilder extends BaseConfBuilder {
  constructor() {
    super();
  }

  interface(i: WgServerInterface): ServerConfBuilder {
    this.section('Interface');
    this.variable('PrivateKey', i.keys.privateKey);
    this.variable('Address', i.address);
    this.variable('ListenPort', i.listenPort.toString());
    this.variable('PreUp', i.preUp);
    this.variable('PostUp', i.postUp);
    this.variable('PreDown', i.preDown);
    this.variable('PostDown', i.postDown);
    return this;
  }

  peer(p: WgServerPeer): ServerConfBuilder {
    this.section('Peer');
    this.variable('PublicKey', p.publicKey);
    this.variable('AllowedIPs', p.allowedIps);
    return this;
  }
}
