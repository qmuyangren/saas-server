import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SendCodeDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return {
      code: 0,
      message: '注册成功',
      data: null,
    };
  }

  @Post('register/send-code')
  @HttpCode(HttpStatus.OK)
  async sendCode(@Body() sendCodeDto: SendCodeDto) {
    return this.authService.sendCode(sendCodeDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: Record<string, any>) {
    return {
      code: 0,
      message: 'success',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }
}
