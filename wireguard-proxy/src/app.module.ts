import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/datasource';
import { TunnelModule } from './tunnel/tunnel.module';
import { Wg0configModule } from './wg0config/wg0config.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot(),
    TunnelModule,
    Wg0configModule,
  ],
})
export class AppModule {}
