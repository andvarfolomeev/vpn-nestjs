import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'tunnel' })
export class TunnelEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'private_key' })
  privateKey: string;

  @Column({ name: 'public_key' })
  publicKey: string;

  @Column({ name: 'allowed_ips', type: 'inet', unique: true })
  allowedIps: string;
}
