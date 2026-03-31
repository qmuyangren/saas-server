import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * 发送注册验证码
   * POST /api/v1/auth/register/send-code
   */
  @Post('register/send-code')
  async sendRegisterCode(@Body('email') email: string) {
    return this.authService.sendRegisterCode(email);
  }

  /**
   * 用户注册
   * POST /api/v1/auth/register
   */
  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('code') code: string,
  ) {
    return this.authService.register(email, password, code);
  }
}
