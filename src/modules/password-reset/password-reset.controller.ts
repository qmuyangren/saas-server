import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { SendResetCodeDto, ResetPasswordDto } from './dto';

@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  /**
   * POST /api/v1/auth/send-reset-code
   * 发送密码重置验证码
   */
  @Post('send-reset-code')
  @HttpCode(HttpStatus.OK)
  async sendResetCode(@Body() dto: SendResetCodeDto) {
    return this.passwordResetService.sendResetCode(dto);
  }

  /**
   * POST /api/v1/auth/reset-password
   * 重置密码
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(dto);
  }
}
