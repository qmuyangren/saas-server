/**
 * 日期工具函数
 *
 * @description
 * 封装常用的日期格式化、计算、解析等操作。
 * 支持自定义格式模板，避免引入 moment.js 等重型库。
 *
 * @example
 * ```typescript
 * // 格式化当前时间
 * DateUtil.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
 *
 * // 格式化指定时间
 * DateUtil.format(date, 'YYYY年MM月DD日');
 *
 * // 获取今天开始时间
 * DateUtil.getStartOfDay();
 *
 * // 获取本月结束时间
 * DateUtil.getEndOfMonth();
 *
 * // 增加天数
 * DateUtil.addDays(new Date(), 7);
 * ```
 */
export class DateUtil {
  /**
   * 格式化日期
   *
   * @param date - 日期对象，默认当前时间
   * @param format - 格式模板，支持 YYYY/MM/DD/HH/mm/ss
   * @returns 格式化后的日期字符串
   */
  static format(
    date: Date = new Date(),
    format = 'YYYY-MM-DD HH:mm:ss',
  ): string {
    const map: Record<string, string> = {
      YYYY: String(date.getFullYear()),
      MM: String(date.getMonth() + 1).padStart(2, '0'),
      DD: String(date.getDate()).padStart(2, '0'),
      HH: String(date.getHours()).padStart(2, '0'),
      mm: String(date.getMinutes()).padStart(2, '0'),
      ss: String(date.getSeconds()).padStart(2, '0'),
    };

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => map[match]);
  }

  /**
   * 获取当天开始时间（00:00:00）
   *
   * @returns 当天开始的 Date 对象
   */
  static getStartOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * 获取当天结束时间（23:59:59）
   *
   * @returns 当天结束的 Date 对象
   */
  static getEndOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * 获取当月开始时间
   *
   * @returns 当月开始的 Date 对象
   */
  static getStartOfMonth(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * 获取当月结束时间
   *
   * @returns 当月结束的 Date 对象
   */
  static getEndOfMonth(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * 增加天数
   *
   * @param date - 基准日期
   * @param days - 增加的天数（负数表示减少）
   * @returns 计算后的 Date 对象
   */
  static addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  /**
   * 增加月数
   *
   * @param date - 基准日期
   * @param months - 增加的月数（负数表示减少）
   * @returns 计算后的 Date 对象
   */
  static addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  /**
   * 计算两个日期之间的天数差
   *
   * @param start - 开始日期
   * @param end - 结束日期
   * @returns 天数差（正数表示 end 在 start 之后）
   */
  static diffDays(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * 判断日期是否在今天之后
   *
   * @param date - 待判断的日期
   * @returns 是否在今天之后
   */
  static isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  /**
   * 判断日期是否在今天之前
   *
   * @param date - 待判断的日期
   * @returns 是否在今天之前
   */
  static isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }
}
