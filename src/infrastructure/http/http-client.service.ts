import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP 客户端服务 - 封装外部 HTTP 请求
 *
 * @description
 * 基于 Axios 的 HTTP 客户端封装，提供统一的请求方法、超时控制、重试机制等。
 * 适用于调用第三方 API、微服务间通信、Webhook 回调等场景。
 *
 * 特性：
 * - 统一请求方法（GET/POST/PUT/DELETE）
 * - 自动重试机制
 * - 超时控制
 * - 请求/响应日志
 *
 * @example
 * ```typescript
 * // GET 请求
 * const data = await this.httpClient.get('https://api.example.com/users');
 *
 * // POST 请求
 * const result = await this.httpClient.post('https://api.example.com/users', {
 *   name: '张三',
 *   email: 'zhangsan@example.com',
 * });
 *
 * // 带重试的请求
 * const data = await this.httpClient.get('https://api.example.com/slow', {
 *   retries: 3,
 *   retryDelay: 1000,
 * });
 * ```
 */
@Injectable()
export class HttpClientService implements OnModuleInit {
  private readonly logger = new Logger(HttpClientService.name);
  private readonly defaultTimeout = 10000;
  private readonly defaultRetries = 0;

  constructor(private readonly httpService: HttpService) {}

  onModuleInit() {
    this.logger.log('HTTP Client initialized');
  }

  /**
   * 发送 GET 请求
   *
   * @param url - 请求 URL
   * @param options - 请求选项
   * @param options.params - 查询参数
   * @param options.headers - 请求头
   * @param options.timeout - 超时时间（毫秒）
   * @param options.retries - 重试次数
   * @returns 响应数据
   */
  async get<T = any>(
    url: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      timeout?: number;
      retries?: number;
    },
  ): Promise<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  /**
   * 发送 POST 请求
   *
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param options - 请求选项
   * @returns 响应数据
   */
  async post<T = any>(
    url: string,
    data?: any,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
      retries?: number;
    },
  ): Promise<T> {
    return this.request<T>('POST', url, data, options);
  }

  /**
   * 发送 PUT 请求
   *
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param options - 请求选项
   * @returns 响应数据
   */
  async put<T = any>(
    url: string,
    data?: any,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
      retries?: number;
    },
  ): Promise<T> {
    return this.request<T>('PUT', url, data, options);
  }

  /**
   * 发送 DELETE 请求
   *
   * @param url - 请求 URL
   * @param options - 请求选项
   * @returns 响应数据
   */
  async delete<T = any>(
    url: string,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
      retries?: number;
    },
  ): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  /**
   * 发送 HTTP 请求（内部方法）
   *
   * @param method - HTTP 方法
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param options - 请求选项
   * @returns 响应数据
   */
  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      timeout?: number;
      retries?: number;
    },
  ): Promise<T> {
    const timeout = options?.timeout ?? this.defaultTimeout;
    const retries = options?.retries ?? this.defaultRetries;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.warn(
            `Retry attempt ${attempt}/${retries} for ${method} ${url}`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }

        const response = await firstValueFrom(
          this.httpService.request<T>({
            method,
            url,
            data,
            params: options?.params,
            headers: options?.headers,
            timeout,
          }),
        );

        this.logger.debug(`${method} ${url} - ${response.status}`);
        return response.data;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`${method} ${url} failed: ${error.message}`);
      }
    }

    throw lastError || new Error(`HTTP request failed: ${method} ${url}`);
  }
}
