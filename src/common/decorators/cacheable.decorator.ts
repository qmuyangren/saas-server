import { SetMetadata } from '@nestjs/common';

/**
 * 缓存装饰器 - 用于接口响应缓存
 *
 * @description
 * 标记需要缓存响应数据的接口，配合缓存拦截器使用。
 * 首次请求执行实际逻辑并缓存结果，后续请求在 TTL 内直接返回缓存数据。
 * 缓存键由 `prefix` + `key` 自动生成，支持动态参数替换。
 *
 * @param options - 缓存配置选项
 * @param options.ttl - 缓存有效期（秒），默认 300 秒（5 分钟）
 * @param options.key - 缓存键名，支持 `:paramName` 动态参数替换
 * @param options.prefix - 缓存键前缀，默认 'cache'
 *
 * @example
 * ```typescript
 * // 基础用法 - 缓存 5 分钟
 * @Cacheable()
 * @Get('list')
 * async findAll() {
 *   return this.dictService.findAll();
 * }
 *
 * // 自定义 TTL 和键名
 * @Cacheable({ ttl: 600, key: 'dict:type' })
 * @Get('type/:code')
 * async findByCode(@Param('code') code: string) {
 *   return this.dictService.findByCode(code);
 * }
 *
 * // 动态参数替换 - 每个 code 值有独立缓存
 * @Cacheable({ ttl: 300, key: 'dict:type::code' })
 * @Get('type/:code')
 * async findByCode(@Param('code') code: string) {
 *   return this.dictService.findByCode(code);
 * }
 *
 * // 带前缀的缓存键
 * @Cacheable({ prefix: 'user', key: 'profile::id', ttl: 60 })
 * @Get('profile/:id')
 * async getProfile(@Param('id') id: string) {
 *   return this.userService.findOne(+id);
 * }
 * ```
 *
 * @see {@link CacheInterceptor} 配合使用的缓存拦截器
 * @see {@link CacheEvict} 缓存清除装饰器
 */
export const Cacheable = (options?: {
  ttl?: number;
  key?: string;
  prefix?: string;
}) => SetMetadata('cacheable', options ?? {});
