import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'settings' })
export class SettingsEntity {
  @PrimaryColumn({ name: 'key' })
  key: string;

  @Column({ name: 'value' })
  value: string;
}
