/**
 * 系统配置模块
 *
 * @description
 * 系统配置模块，负责系统配置的管理。
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CacheModule } from '@/infrastructure/cache/cache.module';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

@Module({
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
  imports: [
    CacheModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any },
    }),
  ],
})
export class ConfigModule {}
