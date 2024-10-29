import { forwardRef, Module } from '@nestjs/common';
import { Wg0configService } from './wg0config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsEntity } from 'src/database/entities';
import { TunnelModule } from 'src/tunnel/tunnel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingsEntity]),
    forwardRef(() => TunnelModule),
  ],
  providers: [Wg0configService],
  exports: [Wg0configService],
})
export class Wg0configModule {}
