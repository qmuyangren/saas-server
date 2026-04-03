import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 验证异常类 - 用于抛出参数校验失败的异常
 *
 * @description
 * 继承自 `HttpException`，专门用于参数校验失败场景。
 * 包含详细的字段级错误信息，便于前端定位问题。
 * 适用于 DTO 校验、业务规则校验、格式校验等场景。
 *
 * @example
 * ```typescript
 * // 基础用法
 * throw new ValidationException('参数校验失败');
 *
 * // 带字段级错误
 * throw new ValidationException('参数校验失败', {
 *   email: '邮箱格式不正确',
 *   password: '密码至少 6 位',
 * });
 *
 * // 在 Service 中使用
 * async create(dto: CreateUserDto) {
 *   if (!this.isValidEmail(dto.email)) {
 *     throw new ValidationException('邮箱格式错误', { email: '请输入有效的邮箱地址' });
 *   }
 * }
 * ```
 */
export class ValidationException extends HttpException {
  code: number;
  message: string;
  errors?: Record<string, any>;

  constructor(message = '参数校验失败', errors?: Record<string, any>) {
    super({ code: 1005, message, errors }, HttpStatus.BAD_REQUEST);
    this.code = 1005;
    this.message = message;
    this.errors = errors;
  }
}
