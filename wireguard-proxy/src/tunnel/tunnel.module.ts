import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TunnelEntity } from 'src/database/entities';
import { TunnelService } from './tunnel.service';
import { Wg0configModule } from 'src/wg0config/wg0config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TunnelEntity]),
    forwardRef(() => Wg0configModule),
  ],
  providers: [TunnelService],
  exports: [TunnelService],
})
export class TunnelModule {}
