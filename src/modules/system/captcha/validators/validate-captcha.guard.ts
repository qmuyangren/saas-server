/**
 * 验证码验证守卫
 *
 * @description
 * 在请求处理前自动验证验证码：
 * - 检查是否需要验证码
 * - 验证验证码是否正确
 * - 自动清理已使用的验证码
 *
 * 使用方式：
 * ```typescript
 * // 在需要验证码的接口上添加装饰器
 * @UseGuards(ValidateCaptchaGuard)
 * @Post('login')
 * login(@Body() dto: LoginDto) { ... }
 * ```
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CaptchaService } from '../captcha.service';

@Injectable()
export class ValidateCaptchaGuard implements CanActivate {
  private readonly logger = new Logger(ValidateCaptchaGuard.name);

  constructor(
    private readonly captchaService: CaptchaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 检查是否需要验证码
    const captchaRequired = await this.isCaptchaRequired(request);
    if (!captchaRequired) {
      return true; // 验证码未启用，跳过验证
    }

    // 验证码已启用，检查请求中是否包含验证码信息
    const { captchaId, captchaResult } = request.body;
    if (!captchaId || !captchaResult) {
      throw new BadRequestException({
        code: 4001,
        message: '验证码不能为空',
        requiredCaptcha: true,
      });
    }

    try {
      // 验证验证码
      const valid = await this.captchaService.verifySliderCaptcha(
        captchaId,
        captchaResult,
      );

      if (!valid) {
        throw new BadRequestException({
          code: 4002,
          message: '验证码错误',
          requiredCaptcha: true,
        });
      }

      return true;
    } catch (error) {
      // 如果是验证码相关错误，返回特殊标记
      if (error instanceof BadRequestException) {
        const response = request.res || {};
        response.statusCode = 400;
      }
      throw error;
    }
  }

  /**
   * 检查是否需要验证码
   */
  private async isCaptchaRequired(request: any): Promise<boolean> {
    // 优先使用装饰器配置
    const requireCaptcha = this.reflector.getAllAndOverride<boolean>(
      'REQUIRE_CAPTCHA',
      [request.handler, request.getClass()],
    );

    // 如果装饰器没有配置，使用全局配置
    if (requireCaptcha === undefined) {
      return this.captchaService.isCaptchaRequired();
    }

    return requireCaptcha;
  }
}

/**
 * 验证码可选装饰器
 *
 * @description
 * 标记接口的验证码为可选（不通过则跳过验证）
 */
export const IsCaptchaOptional = () => SetMetadata('CAPTCHA_OPTIONAL', true);

/**
 * 必须验证码装饰器
 *
 * @description
 * 标记接口必须通过验证码验证
 */
export const RequireCaptcha = () => SetMetadata('REQUIRE_CAPTCHA', true);

/**
 * 跳过验证码装饰器
 *
 * @description
 * 标记接口跳过验证码验证
 */
export const SkipCaptcha = () => SetMetadata('SKIP_CAPTCHA', true);
