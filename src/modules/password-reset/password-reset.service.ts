import { Injectable, BadRequestException, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { User } from '../auth/entities';
import { SendResetCodeDto, ResetPasswordDto } from './dto';

// 错误码定义
export const PasswordResetErrorCodes = {
  INVALID_EMAIL_FORMAT: 1001,
  EMAIL_NOT_FOUND: 1003,
  RATE_LIMIT_EXCEEDED: 1004,
  INVALID_OR_EXPIRED_CODE: 1005,
  PASSWORD_TOO_WEAK: 1006,
} as const;

// 配置常量
const CODE_TTL_SECONDS = 300; // 5 分钟
const SEND_INTERVAL_SECONDS = 60; // 1 分钟
const DAILY_SEND_LIMIT = 5; // 每天 5 次
const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class PasswordResetService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // 初始化 Redis 连接
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', ''),
      db: this.configService.get<number>('REDIS_DB', 0),
    });
  }

  /**
   * 发送密码重置验证码
   */
  async sendResetCode(dto: SendResetCodeDto): Promise<{
    code: number;
    message: string;
    data: { expireIn: number };
  }> {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new BadRequestException({
        code: PasswordResetErrorCodes.INVALID_EMAIL_FORMAT,
        message: '邮箱格式错误',
        data: null,
      });
    }

    // 验证邮箱是否已注册
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException({
        code: PasswordResetErrorCodes.EMAIL_NOT_FOUND,
        message: '该邮箱未注册',
        data: null,
      });
    }

    // 检查发送频率限制
    await this.checkRateLimit(dto.email);

    // 生成 6 位随机验证码
    const code = this.generateCode();

    // 存储验证码到 Redis（5 分钟过期）
    const redisKey = `reset:code:${dto.email}`;
    await this.redis.setex(redisKey, CODE_TTL_SECONDS, code);

    // 记录发送时间用于频率限制
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    // 使用 Redis sorted set 记录今日发送次数
    const dailyKey = `reset:daily:${dto.email}`;
    const dailyPipeline = this.redis.multi();
    dailyPipeline.zremrangebyscore(dailyKey, '-inf', todayStart - 1);
    dailyPipeline.zadd(dailyKey, now, `${now}-${code}`);
    dailyPipeline.expire(dailyKey, 86400); // 24 小时过期
    await dailyPipeline.exec();

    // 记录最近发送时间
    await this.redis.set(`reset:last:${dto.email}`, now.toString(), 'EX', SEND_INTERVAL_SECONDS);

    // 模拟邮件发送（日志输出）
    console.log(`[PasswordReset] 验证码已发送到 ${dto.email}: ${code}`);

    return {
      code: 0,
      message: '验证码已发送',
      data: {
        expireIn: CODE_TTL_SECONDS,
      },
    };
  }

  /**
   * 重置密码
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{
    code: number;
    message: string;
    data: { token: string; userId: string };
  }> {
    // 验证密码强度
    if (!this.validatePasswordStrength(dto.newPassword)) {
      throw new BadRequestException({
        code: PasswordResetErrorCodes.PASSWORD_TOO_WEAK,
        message: '密码强度不足（6-20 位，含字母和数字）',
        data: null,
      });
    }

    // 验证验证码
    const redisKey = `reset:code:${dto.email}`;
    const storedCode = await this.redis.get(redisKey);

    if (!storedCode || storedCode !== dto.code) {
      throw new BadRequestException({
        code: PasswordResetErrorCodes.INVALID_OR_EXPIRED_CODE,
        message: '验证码错误或已过期',
        data: null,
      });
    }

    // 删除已使用的验证码
    await this.redis.del(redisKey);

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException({
        code: PasswordResetErrorCodes.EMAIL_NOT_FOUND,
        message: '该邮箱未注册',
        data: null,
      });
    }

    // 使用 bcrypt 加密新密码
    const hashedPassword = await bcrypt.hash(dto.newPassword, BCRYPT_SALT_ROUNDS);

    // 更新数据库密码
    user.password = hashedPassword;
    user.loginFailures = 0;
    user.lockedUntil = null;
    await this.userRepository.save(user);

    // 生成 JWT Token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d') as JwtSignOptions['expiresIn'];
    const token = this.jwtService.sign(payload, { expiresIn });

    // 记录操作日志
    console.log(`[PasswordReset] 密码已重置：${dto.email}, userId: ${user.id}`);

    return {
      code: 0,
      message: '密码重置成功',
      data: {
        token,
        userId: user.id.toString(),
      },
    };
  }

  /**
   * 检查发送频率限制
   */
  private async checkRateLimit(email: string): Promise<void> {
    const now = Date.now();

    // 检查 1 分钟内是否发送过
    const lastSendKey = `reset:last:${email}`;
    const lastSend = await this.redis.get(lastSendKey);

    if (lastSend) {
      const lastSendTime = parseInt(lastSend, 10);
      if (now - lastSendTime < SEND_INTERVAL_SECONDS * 1000) {
        throw new BadRequestException({
          code: PasswordResetErrorCodes.RATE_LIMIT_EXCEEDED,
          message: '发送频率过高，请稍后再试',
          data: null,
        });
      }
    }

    // 检查今日发送次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const dailyKey = `reset:daily:${email}`;
    const todayCount = await this.redis.zcount(dailyKey, todayStart, '+inf');

    if (todayCount >= DAILY_SEND_LIMIT) {
      throw new BadRequestException({
        code: PasswordResetErrorCodes.RATE_LIMIT_EXCEEDED,
        message: '发送频率过高，请稍后再试',
        data: null,
      });
    }
  }

  /**
   * 生成 6 位随机验证码
   */
  private generateCode(): string {
    return Math.random().toString().padStart(10, '0').substring(2, 8);
  }

  /**
   * 验证密码强度
   */
  private validatePasswordStrength(password: string): boolean {
    if (password.length < 6 || password.length > 20) {
      return false;
    }

    // 必须包含字母和数字
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);

    return hasLetter && hasDigit;
  }

  /**
   * 关闭 Redis 连接（用于优雅关闭）
   */
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
