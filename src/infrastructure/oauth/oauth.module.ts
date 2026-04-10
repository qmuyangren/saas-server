import { Module } from '@nestjs/common';

import { OAuthService } from './oauth.service';
import { CacheModule } from '@/infrastructure/cache/cache.module';

/**
 * 第三方登录模块
 *
 * @description
 * 第三方登录模块，提供第三方登录服务：
 * - 微信登录
 * - 钉钉登录
 * - 企业微信登录
 * - GitHub登录
 */
@Module({
  providers: [OAuthService],
  exports: [OAuthService],
  imports: [CacheModule],
})
export class OAuthModule {}
