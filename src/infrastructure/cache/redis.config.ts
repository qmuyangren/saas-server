import { registerAs } from '@nestjs/config';

/**
 * Redis 缓存配置
 *
 * @description
 * 配置 Redis 客户端的连接参数和连接池选项。
 * 支持单实例、哨兵、集群等多种部署模式。
 * 适用于缓存、会话存储、分布式锁等场景。
 *
 * 配置项说明：
 * - host/port: Redis 服务器地址和端口
 * - password: 认证密码（可选）
 * - db: 数据库索引（0-15）
 * - keyPrefix: 键名前缀，避免命名冲突
 * - retryStrategy: 重连策略配置
 *
 * @example
 * ```typescript
 * // 环境变量配置
 * REDIS_HOST=localhost
 * REDIS_PORT=6379
 * REDIS_PASSWORD=your_password
 * REDIS_DB=0
 * REDIS_KEY_PREFIX=app:
 * REDIS_RETRY_DELAY=3000
 * REDIS_MAX_RETRIES=10
 *
 * // 在模块中使用
 * const config = this.configService.get('redis');
 * ```
 */
export default registerAs('redis', () => ({
  /** Redis 服务器地址 */
  host: process.env.REDIS_HOST || 'localhost',

  /** Redis 服务器端口 */
  port: parseInt(process.env.REDIS_PORT || '6379', 10),

  /** 认证密码 */
  password: process.env.REDIS_PASSWORD || undefined,

  /** 数据库索引 (0-15) */
  db: parseInt(process.env.REDIS_DB || '0', 10),

  /** 键名前缀，用于隔离不同应用的缓存 */
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'app:',

  /** 重连延迟时间（毫秒） */
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '3000', 10),

  /** 最大重连次数 */
  maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '10', 10),

  /** 连接超时时间（毫秒） */
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),

  /** 命令超时时间（毫秒） */
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10),

  /** 是否启用 TLS 加密 */
  tls: process.env.REDIS_TLS === 'true',
}));
