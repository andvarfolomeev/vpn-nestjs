export type WgKeys = {
  privateKey: string;
  publicKey: string;
};

export type WgServerInterface = {
  keys: WgKeys;
  ipAddress: string;
  address: string;
  listenPort: string | number;
  preUp: string[];
  postUp: string[];
  preDown: string[];
  postDown: string[];
};

export type WgServerPeer = {
  publicKey: string;
  allowedIps: string;
};

export type WgTunnelInterface = {
  privateKey: string;
  address: string;
  dns: string;
};

export type WgTunnelPeer = {
  publicKey: string;
  allowedIps: string;
  ipAddress: string;
  listenPort: string | number;
  persistentKeepalive: string | number;
};
