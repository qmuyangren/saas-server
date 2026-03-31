import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, rememberMe } = loginDto;

    // TODO: 从数据库查询用户
    // TODO: 验证密码 (bcrypt)
    // TODO: 检查登录失败次数 (Redis 限流)

    // 模拟用户数据
    const user = {
      id: 1,
      email: email,
      role: 'user',
      createdAt: new Date(),
    };

    // 生成 JWT Token
    const payload = { sub: user.id, email: user.email };
    const expiresIn = rememberMe ? '7d' : '2h';
    const token = this.jwtService.sign(payload, { expiresIn });

    return {
      code: 0,
      message: 'success',
      data: {
        token,
        expiresIn: rememberMe ? 604800 : 7200,
        user,
      },
    };
  }

  /**
   * 用户注册 - 发送验证码
   * POST /api/v1/auth/register/send-code
   */
  async sendRegisterCode(email: string): Promise<{ code: number; message: string }> {
    // TODO: 检查邮箱是否已注册
    // TODO: 生成 6 位验证码
    // TODO: 存储到 Redis (5 分钟过期)
    // TODO: 发送邮件

    return {
      code: 0,
      message: '验证码已发送',
    };
  }

  /**
   * 用户注册
   * POST /api/v1/auth/register
   */
  async register(email: string, password: string, code: string): Promise<AuthResponseDto> {
    // TODO: 验证验证码
    // TODO: 验证密码强度
    // TODO: 创建用户
    // TODO: 自动登录

    return {
      code: 0,
      message: '注册成功',
      data: {
        token: 'mock-token',
        expiresIn: 604800,
        user: {
          id: 1,
          email,
          role: 'user',
          createdAt: new Date(),
        },
      },
    };
  }
}
