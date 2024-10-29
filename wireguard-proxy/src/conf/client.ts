import { WgTunnelInterface, WgTunnelPeer } from 'src/types';
import { BaseConfBuilder } from './base-conf';

export class TunnelConfBuilder extends BaseConfBuilder {
  constructor() {
    super();
  }

  interface(i: WgTunnelInterface): TunnelConfBuilder {
    this.section('Interface');
    this.variable('PrivateKey', i.privateKey);
    this.variable('Address', i.address);
    this.variable('DNS', i.dns);
    return this;
  }

  peer(p: WgTunnelPeer): TunnelConfBuilder {
    this.section('Peer');
    this.variable('PublicKey', p.publicKey);
    this.variable('AllowedIPs', p.allowedIps);
    this.variable('Endpoint', `${p.ipAddress}:${p.listenPort}`);
    this.variable('PersistentKeepalive', p.persistentKeepalive.toString());
    return this;
  }
}
