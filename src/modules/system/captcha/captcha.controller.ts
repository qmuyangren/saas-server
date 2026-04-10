import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';

import { CaptchaService } from './captcha.service';
import { SliderCaptchaResponse } from './entities/login.entity';

/**
 * 验证码控制器
 *
 * @description
 * 提供验证码相关的公共接口：
 * - 滑块验证码生成
 * - 滑块验证码验证
 *
 * 使用场景：登录、注册、发送短信等需要验证码的场景
 */
@ApiTags('验证码')
@Controller('common/captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  /**
   * 获取滑块验证码
   */
  @Get('slider')
  @ApiOperation({ summary: '获取滑块验证码' })
  async createSliderCaptcha(): Promise<SliderCaptchaResponse> {
    return this.captchaService.createSliderCaptcha();
  }

  /**
   * 验证滑块验证码
   */
  @Post('slider/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证滑块验证码' })
  @ApiResponse({ status: 200, description: '验证结果' })
  async verifySliderCaptcha(
    @Body() dto: { captchaId: string; captchaResult: string },
  ): Promise<{ valid: boolean; message?: string }> {
    try {
      const valid = await this.captchaService.verifySliderCaptcha(dto.captchaId, dto.captchaResult);
      return { valid, message: valid ? '验证通过' : '验证失败' };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }
}
