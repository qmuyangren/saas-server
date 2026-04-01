import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PasswordResetModule } from './modules/password-reset/password-reset.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    // 加载 .env 文件
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 数据库配置
    TypeOrmModule.forRoot(databaseConfig()),
    // 业务模块
    AuthModule,
    PasswordResetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
