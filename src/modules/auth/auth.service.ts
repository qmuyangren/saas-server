import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, LoginLog, VerificationCode } from './entities';
import { LoginDto, RegisterDto, SendCodeDto } from './dto';
import { ConfigService } from '@nestjs/config';

// 错误码定义
export const ErrorCodes = {
  // 参数错误 (1001-1999)
  INVALID_PARAMS: 1001,
  EMAIL_EXISTS: 1002,

  // 认证错误 (1001-1999)
  INVALID_PASSWORD: 1003,
  ACCOUNT_LOCKED: 1004,

  // 服务器错误 (2001-2999)
  INTERNAL_ERROR: 2001,
} as const;

// 账户锁定配置
const MAX_LOGIN_FAILURES = 5;
const LOCK_DURATION_MINUTES = 30;
const BCRYPT_SALT_ROUNDS = 10;

// Token 过期时间配置（秒）
const TOKEN_EXPIRY = {
  DEFAULT: 7 * 24 * 60 * 60, // 7 天
  REMEMBER_ME: 30 * 24 * 60 * 60, // 30 天
};

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    expiresIn: number;
    user: {
      id: number;
      email: string;
      createdAt: Date;
    };
  };
}

export interface AuthPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LoginLog)
    private readonly loginLogRepository: Repository<LoginLog>,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<void> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException({
        code: ErrorCodes.EMAIL_EXISTS,
        message: '该邮箱已被注册',
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role || 'user',
    });

    await this.userRepository.save(user);
  }

  async sendCode(
    dto: SendCodeDto,
  ): Promise<{ code: number; message: string; data: null }> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException({
        code: ErrorCodes.EMAIL_EXISTS,
        message: '该邮箱已被注册',
        data: null,
      });
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const verificationCode = this.verificationCodeRepository.create({
      email: dto.email,
      code,
      type: 'register',
      expiresAt,
      used: false,
    });

    await this.verificationCodeRepository.save(verificationCode);

    return {
      code: 0,
      message: '验证码已发送',
      data: null,
    };
  }

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      await this.logLoginAttempt(
        undefined,
        dto.email,
        false,
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_PASSWORD,
        message: '密码错误',
        data: null,
      });
    }

    if (user.isLocked()) {
      await this.logLoginAttempt(
        user.id,
        dto.email,
        false,
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException({
        code: ErrorCodes.ACCOUNT_LOCKED,
        message: `账户已锁定，请 ${LOCK_DURATION_MINUTES} 分钟后再试`,
        data: {
          lockedUntil: user.lockedUntil?.toISOString(),
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      user.loginFailures += 1;

      if (user.loginFailures >= MAX_LOGIN_FAILURES) {
        const lockedUntil = new Date();
        lockedUntil.setMinutes(
          lockedUntil.getMinutes() + LOCK_DURATION_MINUTES,
        );
        user.lockedUntil = lockedUntil;
      }

      await this.userRepository.save(user);
      await this.logLoginAttempt(
        user.id,
        dto.email,
        false,
        ipAddress,
        userAgent,
      );

      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_PASSWORD,
        message: '密码错误',
        data: null,
      });
    }

    if (user.loginFailures > 0 || user.lockedUntil) {
      user.loginFailures = 0;
      user.lockedUntil = null;
      await this.userRepository.save(user);
    }

    const expiresIn = dto.rememberMe
      ? TOKEN_EXPIRY.REMEMBER_ME
      : TOKEN_EXPIRY.DEFAULT;
    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload, { expiresIn });

    await this.logLoginAttempt(user.id, dto.email, true, ipAddress, userAgent);

    return {
      code: 0,
      message: 'success',
      data: {
        token,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    };
  }

  async validateToken(payload: AuthPayload): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: payload.sub },
    });
  }

  private async logLoginAttempt(
    userId: number | undefined,
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const log = this.loginLogRepository.create({
      userId: userId || 0,
      email,
      success,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    await this.loginLogRepository.save(log);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
