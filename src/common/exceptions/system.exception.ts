import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 系统异常类 - 用于抛出系统级别的异常
 *
 * @description
 * 继承自 `HttpException`，用于系统级别的异常处理。
 * 通常表示服务器内部错误，如数据库连接失败、第三方服务不可用、缓存异常等。
 * 此类异常通常不需要用户操作，而是需要运维或开发人员介入处理。
 *
 * @example
 * ```typescript
 * // 基础用法
 * throw new SystemException('数据库连接失败');
 *
 * // 自定义错误码
 * throw new SystemException('Redis 连接超时', 5002);
 *
 * // 在 Service 中使用
 * async getCache(key: string) {
 *   try {
 *     return await this.redis.get(key);
 *   } catch (error) {
 *     throw new SystemException('缓存服务异常', 5002);
 *   }
 * }
 * ```
 */
export class SystemException extends HttpException {
  code: number;
  message: string;

  constructor(message = '系统异常', code = 5000) {
    super({ code, message }, HttpStatus.INTERNAL_SERVER_ERROR);
    this.code = code;
    this.message = message;
  }
}
