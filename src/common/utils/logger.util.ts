import { Logger } from '@nestjs/common';

/**
 * 日志工具函数
 *
 * @description
 * 封装 NestJS Logger 的常用操作，提供统一的日志记录接口。
 * 支持不同级别的日志输出（debug、log、warn、error），便于问题排查。
 *
 * @example
 * ```typescript
 * // 在 Service 中使用
 * private readonly logger = LoggerUtil.createLogger(MyService.name);
 *
 * this.logger.debug('调试信息');
 * this.logger.log('普通日志');
 * this.logger.warn('警告信息');
 * this.logger.error('错误信息', error.stack);
 *
 * // 静态方法直接使用
 * LoggerUtil.debug('模块名', '调试信息');
 * LoggerUtil.error('模块名', '错误信息', error);
 * ```
 */
export class LoggerUtil {
  /**
   * 创建 Logger 实例
   *
   * @param context - 日志上下文（通常是类名或模块名）
   * @returns Logger 实例
   */
  static createLogger(context: string): Logger {
    return new Logger(context);
  }

  /**
   * 输出 Debug 级别日志
   *
   * @param context - 日志上下文
   * @param message - 日志消息
   */
  static debug(context: string, message: string): void {
    new Logger(context).debug(message);
  }

  /**
   * 输出 Info 级别日志
   *
   * @param context - 日志上下文
   * @param message - 日志消息
   */
  static log(context: string, message: string): void {
    new Logger(context).log(message);
  }

  /**
   * 输出 Warn 级别日志
   *
   * @param context - 日志上下文
   * @param message - 日志消息
   */
  static warn(context: string, message: string): void {
    new Logger(context).warn(message);
  }

  /**
   * 输出 Error 级别日志
   *
   * @param context - 日志上下文
   * @param message - 错误消息
   * @param trace - 错误堆栈（可选）
   */
  static error(context: string, message: string, trace?: string): void {
    new Logger(context).error(message, trace);
  }

  /**
   * 输出 Verbose 级别日志
   *
   * @param context - 日志上下文
   * @param message - 日志消息
   */
  static verbose(context: string, message: string): void {
    new Logger(context).verbose(message);
  }
}
