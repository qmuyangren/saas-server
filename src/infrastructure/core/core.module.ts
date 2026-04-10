/**
 * 核心模块
 *
 * @description
 * 核心模块，提供全局服务：
 * - AuthGuard 认证守卫
 * - RolesGuard 角色守卫
 * - JwtService JWT 服务
 */
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET', 'your-secret-key');
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '7d');
        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard],
})
export class CoreModule {}
