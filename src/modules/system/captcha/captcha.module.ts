import { Module } from '@nestjs/common';

import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';
import { CacheModule } from '@/infrastructure/cache/cache.module';
import { AccountValidatorController } from './validators/account-validator.controller';
import { AccountValidationService } from './services/account-validation.service';

/**
 * 验证码模块
 *
 * @description
 * 验证码模块，提供通用的验证码服务：
 * - 滑块验证码生成和验证
 * - 账号唯一性验证
 * - 验证码缓存管理
 */
@Module({
  controllers: [CaptchaController, AccountValidatorController],
  providers: [CaptchaService, AccountValidationService],
  exports: [CaptchaService, AccountValidationService],
  imports: [CacheModule],
})
export class CaptchaModule {}
