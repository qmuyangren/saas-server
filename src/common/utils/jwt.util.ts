import * as jwt from 'jsonwebtoken';

/**
 * JWT 工具函数
 *
 * @description
 * 封装 JWT 的签发、验证、解码等常用操作。
 * 支持自定义密钥、过期时间、算法等配置。
 *
 * @example
 * ```typescript
 * // 签发 Token
 * const token = JwtUtil.sign({ userId: 1, role: 'admin' }, 'secret', '7d');
 *
 * // 验证 Token
 * const payload = JwtUtil.verify(token, 'secret');
 *
 * // 解码 Token（不验证）
 * const decoded = JwtUtil.decode(token);
 * ```
 */
export class JwtUtil {
  /**
   * 签发 JWT Token
   *
   * @param payload - Token 负载数据
   * @param secret - 签名密钥
   * @param expiresIn - 过期时间，如 '7d', '24h', '60m'
   * @param algorithm - 签名算法，默认 HS256
   * @returns 签发的 JWT Token 字符串
   */
  static sign(
    payload: object | string | Buffer,
    secret: string,
    expiresIn?: string | number,
    algorithm: jwt.Algorithm = 'HS256',
  ): string {
    const options: jwt.SignOptions = { algorithm };
    if (expiresIn) {
      options.expiresIn = expiresIn as jwt.SignOptions['expiresIn'];
    }
    return jwt.sign(payload, secret, options);
  }

  /**
   * 验证 JWT Token
   *
   * @param token - JWT Token 字符串
   * @param secret - 签名密钥
   * @param algorithm - 签名算法，默认 HS256
   * @returns 验证后的负载数据
   * @throws jwt.JsonWebTokenError Token 无效
   * @throws jwt.TokenExpiredError Token 已过期
   */
  static verify(
    token: string,
    secret: string,
    algorithm: jwt.Algorithm = 'HS256',
  ): jwt.JwtPayload | string {
    return jwt.verify(token, secret, { algorithms: [algorithm] });
  }

  /**
   * 解码 JWT Token（不验证签名）
   *
   * @param token - JWT Token 字符串
   * @returns 解码后的负载数据，验证失败返回 null
   */
  static decode(token: string): jwt.JwtPayload | null {
    try {
      return jwt.decode(token) as jwt.JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * 检查 Token 是否过期
   *
   * @param token - JWT Token 字符串
   * @returns 是否已过期
   */
  static isExpired(token: string): boolean {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  }

  /**
   * 获取 Token 剩余有效时间（秒）
   *
   * @param token - JWT Token 字符串
   * @returns 剩余有效时间（秒），已过期返回 0
   */
  static getRemainingTime(token: string): number {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    const remaining = decoded.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : 0;
  }
}
