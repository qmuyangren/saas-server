/**
 * 数据验证工具函数
 *
 * @description
 * 提供常用的数据格式验证方法，包括手机号、邮箱、身份证、URL、时间等。
 * 所有验证方法均返回 boolean，便于在 DTO 校验、业务逻辑中使用。
 *
 * @example
 * ```typescript
 * // 验证手机号
 * ValidatorUtil.isPhone('13812345678'); // true
 *
 * // 验证邮箱
 * ValidatorUtil.isEmail('user@example.com'); // true
 *
 * // 验证身份证
 * ValidatorUtil.isIdCard('110101199001011234'); // true
 *
 * // 验证 URL
 * ValidatorUtil.isUrl('https://example.com'); // true
 *
 * // 验证日期格式
 * ValidatorUtil.isDate('2024-01-01'); // true
 * ```
 */
export class ValidatorUtil {
  /**
   * 验证中国大陆手机号
   *
   * @description
   * 支持 13-19 开头的 11 位手机号码。
   *
   * @param phone - 待验证的手机号
   * @returns 是否为有效手机号
   */
  static isPhone(phone: string): boolean {
    return /^1[3-9]\d{9}$/.test(phone);
  }

  /**
   * 验证邮箱地址
   *
   * @description
   * 支持常见的邮箱格式，包括字母、数字、下划线、点号等。
   *
   * @param email - 待验证的邮箱
   * @returns 是否为有效邮箱
   */
  static isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * 验证中国大陆身份证号（18 位）
   *
   * @description
   * 验证 18 位身份证号，包括格式校验和校验位计算。
   *
   * @param idCard - 待验证的身份证号
   * @returns 是否为有效身份证号
   */
  static isIdCard(idCard: string): boolean {
    if (!/^\d{17}[\dXx]$/.test(idCard)) {
      return false;
    }

    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(idCard[i]) * weights[i];
    }

    const checkCode = checkCodes[sum % 11];
    return idCard[17].toUpperCase() === checkCode;
  }

  /**
   * 验证 URL 地址
   *
   * @description
   * 支持 http 和 https 协议的 URL 格式验证。
   *
   * @param url - 待验证的 URL
   * @returns 是否为有效 URL
   */
  static isUrl(url: string): boolean {
    return /^https?:\/\/[^\s]+$/.test(url);
  }

  /**
   * 验证 IPv4 地址
   *
   * @param ip - 待验证的 IP 地址
   * @returns 是否为有效 IPv4 地址
   */
  static isIPv4(ip: string): boolean {
    return (
      /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
      ip.split('.').every((num) => parseInt(num) >= 0 && parseInt(num) <= 255)
    );
  }

  /**
   * 验证日期格式（YYYY-MM-DD）
   *
   * @param date - 待验证的日期字符串
   * @returns 是否为有效日期格式
   */
  static isDate(date: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }

  /**
   * 验证日期时间格式（YYYY-MM-DD HH:mm:ss）
   *
   * @param datetime - 待验证的日期时间字符串
   * @returns 是否为有效日期时间格式
   */
  static isDateTime(datetime: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) {
      return false;
    }
    const d = new Date(datetime.replace(' ', 'T'));
    return d instanceof Date && !isNaN(d.getTime());
  }

  /**
   * 验证时间格式（HH:mm:ss）
   *
   * @param time - 待验证的时间字符串
   * @returns 是否为有效时间格式
   */
  static isTime(time: string): boolean {
    if (!/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return false;
    }
    const [h, m, s] = time.split(':').map(Number);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59;
  }

  /**
   * 验证是否为正整数
   *
   * @param value - 待验证的值
   * @returns 是否为正整数
   */
  static isPositiveInteger(value: string | number): boolean {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    return Number.isInteger(num) && num > 0;
  }

  /**
   * 验证金额格式（最多两位小数）
   *
   * @param amount - 待验证的金额
   * @returns 是否为有效金额格式
   */
  static isAmount(amount: string): boolean {
    return /^\d+(\.\d{1,2})?$/.test(amount);
  }

  /**
   * 验证邮编（中国大陆 6 位）
   *
   * @param code - 待验证的邮编
   * @returns 是否为有效邮编
   */
  static isPostalCode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  /**
   * 验证统一社会信用代码（18 位）
   *
   * @param code - 待验证的信用代码
   * @returns 是否为有效信用代码
   */
  static isCreditCode(code: string): boolean {
    return /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(code);
  }

  /**
   * 验证密码强度（弱：6-20 位字母数字）
   *
   * @param password - 待验证的密码
   * @returns 是否为弱密码强度
   */
  static isWeakPassword(password: string): boolean {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,20}$/.test(password);
  }

  /**
   * 验证密码强度（中：8-20 位大小写字母+数字）
   *
   * @param password - 待验证的密码
   * @returns 是否为中密码强度
   */
  static isMediumPassword(password: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,20}$/.test(
      password,
    );
  }

  /**
   * 验证密码强度（强：8-20 位大小写字母+数字+特殊字符）
   *
   * @param password - 待验证的密码
   * @returns 是否为强密码强度
   */
  static isStrongPassword(password: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(
      password,
    );
  }

  /**
   * 验证是否为纯数字
   *
   * @param value - 待验证的值
   * @returns 是否为纯数字
   */
  static isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }

  /**
   * 验证是否为纯字母
   *
   * @param value - 待验证的值
   * @returns 是否为纯字母
   */
  static isAlpha(value: string): boolean {
    return /^[a-zA-Z]+$/.test(value);
  }

  /**
   * 验证是否为字母数字组合
   *
   * @param value - 待验证的值
   * @returns 是否为字母数字组合
   */
  static isAlphanumeric(value: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(value);
  }

  /**
   * 验证是否为 Base64 编码
   *
   * @param value - 待验证的值
   * @returns 是否为 Base64 编码
   */
  static isBase64(value: string): boolean {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    );
  }

  /**
   * 验证是否为 UUID v4
   *
   * @param value - 待验证的值
   * @returns 是否为 UUID v4
   */
  static isUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  /**
   * 验证是否为座机号码
   *
   * @param phone - 待验证的座机号
   * @returns 是否为有效座机号
   */
  static isTelephone(phone: string): boolean {
    return /^0\d{2,3}-?\d{7,8}$/.test(phone);
  }

  /**
   * 验证是否为传真号码
   *
   * @param fax - 待验证的传真号
   * @returns 是否为有效传真号
   */
  static isFax(fax: string): boolean {
    return /^(\+?\d{1,3}-)?\d{2,4}-?\d{7,8}$/.test(fax);
  }
}
