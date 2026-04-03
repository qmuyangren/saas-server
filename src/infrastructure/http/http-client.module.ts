import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpClientService } from './http-client.service';

/**
 * HTTP 客户端模块
 *
 * @description
 * 注册 HTTP 客户端服务，提供全局 HTTP 请求能力。
 * 配置默认超时、重试策略等选项。
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {}
