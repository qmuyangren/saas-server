import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常类 - 用于抛出业务逻辑相关的异常
 *
 * @description
 * 继承自 `HttpException`，用于统一业务异常的处理。
 * 包含自定义错误码和错误消息，配合全局异常过滤器使用。
 * 适用于所有业务逻辑校验失败的场景（如数据不存在、状态不允许、权限不足等）。
 *
 * @example
 * ```typescript
 * // 基础用法
 * throw new BusinessException(2001, '用户名已存在');
 *
 * // 带额外数据
 * throw new BusinessException(2003, '存在关联数据', { count: 5 });
 *
 * // 在 Service 中使用
 * async remove(id: number) {
 *   const user = await this.findById(id);
 *   if (!user) {
 *     throw new BusinessException(2002, '用户不存在');
 *   }
 *   // ...
 * }
 * ```
 */
export class BusinessException extends HttpException {
  code: number;
  message: string;
  data?: any;

  constructor(code: number, message: string, data?: any) {
    super({ code, message, data }, HttpStatus.BAD_REQUEST);
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
