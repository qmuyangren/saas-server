/**
 * 用户模块
 *
 * @description
 * 用户管理模块，负责用户的基础管理功能。
 */
import { Module } from '@nestjs/common';

import { CaptchaModule } from '@/modules/system/captcha/captcha.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [CaptchaModule],
})
export class UserModule {}
