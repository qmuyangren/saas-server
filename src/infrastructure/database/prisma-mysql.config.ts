import { registerAs } from '@nestjs/config';

/**
 * Prisma MySQL 数据库配置
 *
 * @description
 * 配置 Prisma 客户端与 MySQL 数据库的连接参数。
 * 支持连接池配置、超时设置、SSL 选项等。
 * 适用于生产环境和开发环境的数据库连接管理。
 *
 * 配置项说明：
 * - url: 数据库连接字符串，格式 mysql://user:pass@host:port/db
 * - pool: 连接池配置，控制最大/最小连接数
 * - timeout: 查询和连接超时时间
 * - ssl: SSL/TLS 加密连接配置
 *
 * @example
 * ```typescript
 * // 环境变量配置
 * // .env
 * DATABASE_URL="mysql://root:password@localhost:3306/enterprise_mgmt"
 * DB_POOL_MAX=10
 * DB_POOL_MIN=2
 * DB_CONNECT_TIMEOUT=10000
 *
 * // 在模块中使用
 * const config = this.configService.get('database');
 * ```
 */
export default registerAs('database', () => ({
  /** 数据库连接字符串 */
  url:
    process.env.DATABASE_URL ||
    'mysql://root:password@localhost:3306/enterprise_mgmt',

  /** 连接池最大连接数，默认 10 */
  poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),

  /** 连接池最小连接数，默认 2 */
  poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),

  /** 连接超时时间（毫秒），默认 10000 */
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000', 10),

  /** 查询超时时间（毫秒），默认 30000 */
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10),

  /** 是否启用 SSL 加密连接 */
  ssl: process.env.DB_SSL === 'true',

  /** 是否启用 Prisma 查询日志 */
  logging: process.env.NODE_ENV === 'development',
}));
