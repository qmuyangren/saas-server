/**
 * 字符串工具函数
 *
 * @description
 * 封装常用的字符串处理操作，包括截断、脱敏、格式化等。
 * 避免在业务代码中重复实现字符串处理逻辑。
 *
 * @example
 * ```typescript
 * // 截断字符串
 * StringUtil.truncate('这是一段很长的文本', 10, '...');
 *
 * // 脱敏手机号
 * StringUtil.maskPhone('13812345678'); // 138****5678
 *
 * // 首字母大写
 * StringUtil.capitalize('hello'); // Hello
 *
 * // 驼峰转下划线
 * StringUtil.camelToSnake('userName'); // user_name
 * ```
 */
export class StringUtil {
  /**
   * 截断字符串，超出长度用省略号替代
   *
   * @param str - 原始字符串
   * @param maxLength - 最大长度
   * @param suffix - 超出时的后缀，默认 '...'
   * @returns 截断后的字符串
   */
  static truncate(str: string, maxLength: number, suffix = '...'): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * 脱敏手机号，中间 4 位替换为 *
   *
   * @param phone - 手机号
   * @returns 脱敏后的手机号
   */
  static maskPhone(phone: string): string {
    if (phone.length < 7) {
      return phone;
    }
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  }

  /**
   * 脱敏邮箱，用户名部分替换为 *
   *
   * @param email - 邮箱地址
   * @returns 脱敏后的邮箱
   */
  static maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!name || !domain) {
      return email;
    }
    const maskedName = name.slice(0, 2) + '***';
    return maskedName + '@' + domain;
  }

  /**
   * 脱敏身份证号，中间部分替换为 *
   *
   * @param idCard - 身份证号
   * @returns 脱敏后的身份证号
   */
  static maskIdCard(idCard: string): string {
    if (idCard.length < 10) {
      return idCard;
    }
    return idCard.slice(0, 4) + '**********' + idCard.slice(-4);
  }

  /**
   * 首字母大写
   *
   * @param str - 原始字符串
   * @returns 首字母大写后的字符串
   */
  static capitalize(str: string): string {
    if (!str) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 驼峰命名转下划线命名
   *
   * @param str - 驼峰命名字符串
   * @returns 下划线命名字符串
   */
  static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * 下划线命名转驼峰命名
   *
   * @param str - 下划线命名字符串
   * @returns 驼峰命名字符串
   */
  static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 移除字符串中的 HTML 标签
   *
   * @param str - 包含 HTML 的字符串
   * @returns 纯文本字符串
   */
  static stripHtml(str: string): string {
    return str.replace(/<[^>]+>/g, '');
  }

  /**
   * 生成随机字符串
   *
   * @param length - 字符串长度，默认 16
   * @param chars - 字符集，默认字母数字
   * @returns 随机字符串
   */
  static random(
    length = 16,
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 判断字符串是否为空或空白
   *
   * @param str - 待检查的字符串
   * @returns 是否为空
   */
  static isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  }
}
