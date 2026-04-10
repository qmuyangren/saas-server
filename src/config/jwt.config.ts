import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '2h',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
}));

/**
 * JWT 配置接口
 */
export interface JwtConfig {
  /**
   * 访问密钥
   */
  secret: string;
  /**
   * 访问 token 过期时间
   */
  accessTokenExpiresIn: string;
  /**
   * 刷新 token 过期时间
   */
  refreshTokenExpiresIn: string;
}

/**
 * JWT 策略配置
 */
export const jwtStrategyConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '2h',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
};
