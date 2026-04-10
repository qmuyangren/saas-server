import { Module } from '@nestjs/common';

import { AuthController, UserController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { JwtStrategy } from '@/common/strategy/jwt.strategy';
import { CacheModule } from '@/infrastructure/cache/cache.module';
import { TenantModule } from '../tenant/tenant.module';

/**
 * 认证模块
 *
 * @description
 * 提供认证相关的功能：
 * - 账密登录（支持多租户）
 * - 微信扫码登录
 * - 第三方登录
 * - Token 管理
 * - 设备管理
 * - 租户切换
 */
@Module({
  controllers: [AuthController, UserController],
  providers: [AuthService, JwtAuthGuard, JwtStrategy],
  exports: [AuthService, JwtAuthGuard, JwtStrategy],
  imports: [CacheModule, TenantModule],
})
export class AuthModule {}
