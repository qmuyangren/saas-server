import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

// 模拟数据库（生产环境替换为 TypeORM）
const users: any[] = [
  { id: 1, email: 'test@example.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'user' }
];

// 模拟 Redis（生产环境替换为 Redis）
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

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

    // 检查账户是否被锁定
    const lockInfo = loginAttempts.get(email);
    if (lockInfo && lockInfo.lockedUntil > Date.now()) {
      const minutes = Math.ceil((lockInfo.lockedUntil - Date.now()) / 60000);
      throw new UnauthorizedException(`账户已锁定，请${minutes}分钟后再试`);
    }

    // 查询用户
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码（bcrypt）
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // 记录失败次数
      this.recordLoginFailure(email);
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 重置失败计数
    loginAttempts.delete(email);

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
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: new Date(),
        },
      },
    };
  }

  /**
   * 记录登录失败
   */
  private recordLoginFailure(email: string): void {
    const attempts = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
    attempts.count += 1;
    
    // 5 次失败后锁定 30 分钟
    if (attempts.count >= 5) {
      attempts.lockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    }
    
    loginAttempts.set(email, attempts);
  }

  /**
   * 用户注册 - 发送验证码
   * POST /api/v1/auth/register/send-code
   */
  async sendRegisterCode(email: string): Promise<{ code: number; message: string; data?: any }> {
    // 检查邮箱是否已注册
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new ConflictException('该邮箱已注册');
    }

    // 生成 6 位验证码
    const code = Math.random().toString().padEnd(6, '0').substring(0, 6);
    
    // 存储验证码（5 分钟过期）
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // TODO: 实际项目中发送邮件
    console.log(`验证码：${code}（有效期 5 分钟）`);

    return {
      code: 0,
      message: '验证码已发送',
      data: { expiresIn: 300 },
    };
  }

  /**
   * 用户注册
   * POST /api/v1/auth/register
   */
  async register(email: string, password: string, code: string): Promise<AuthResponseDto> {
    // 检查邮箱是否已注册
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new ConflictException('该邮箱已注册');
    }

    // 验证验证码
    const verificationCode = verificationCodes.get(email);
    if (!verificationCode) {
      throw new BadRequestException('请先获取验证码');
    }
    if (verificationCode.expiresAt < Date.now()) {
      verificationCodes.delete(email);
      throw new BadRequestException('验证码已过期');
    }
    if (verificationCode.code !== code) {
      throw new BadRequestException('验证码错误');
    }

    // 验证密码强度
    if (password.length < 6 || password.length > 20) {
      throw new BadRequestException('密码长度必须为 6-20 位');
    }
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      throw new BadRequestException('密码必须包含字母和数字');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      role: 'user' as const,
    };
    users.push(newUser);

    // 删除验证码
    verificationCodes.delete(email);

    // 自动生成 Token（自动登录）
    const payload = { sub: newUser.id, email: newUser.email };
    const token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      code: 0,
      message: '注册成功',
      data: {
        token,
        expiresIn: 604800,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          createdAt: new Date(),
        },
      },
    };
  }
}
