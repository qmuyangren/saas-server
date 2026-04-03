import { registerAs } from '@nestjs/config';

/**
 * 消息队列配置
 *
 * @description
 * 配置消息队列服务的连接参数和消费者选项。
 * 支持 RabbitMQ、Redis Streams 等多种队列后端。
 * 适用于异步任务处理、事件驱动架构、削峰填谷等场景。
 *
 * 配置项说明：
 * - host/port: 队列服务器地址和端口
 * - username/password: 认证凭据
 * - vhost: 虚拟主机，用于隔离不同环境
 * - prefetch: 消费者预取数量，控制并发处理
 * - retry: 失败重试策略
 *
 * @example
 * ```typescript
 * // 环境变量配置
 * QUEUE_HOST=localhost
 * QUEUE_PORT=5672
 * QUEUE_USER=guest
 * QUEUE_PASS=guest
 * QUEUE_VHOST=/
 * QUEUE_PREFETCH=10
 * QUEUE_RETRY_DELAY=5000
 * QUEUE_MAX_RETRIES=3
 *
 * // 在模块中使用
 * const config = this.configService.get('queue');
 * ```
 */
export default registerAs('queue', () => ({
  /** 队列服务器地址 */
  host: process.env.QUEUE_HOST || 'localhost',

  /** 队列服务器端口 */
  port: parseInt(process.env.QUEUE_PORT || '5672', 10),

  /** 认证用户名 */
  username: process.env.QUEUE_USER || 'guest',

  /** 认证密码 */
  password: process.env.QUEUE_PASS || 'guest',

  /** 虚拟主机，用于隔离不同环境 */
  vhost: process.env.QUEUE_VHOST || '/',

  /** 消费者预取数量，控制并发处理数 */
  prefetch: parseInt(process.env.QUEUE_PREFETCH || '10', 10),

  /** 失败重试延迟（毫秒） */
  retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || '5000', 10),

  /** 最大重试次数 */
  maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3', 10),

  /** 是否启用持久化 */
  durable: process.env.QUEUE_DURABLE !== 'false',

  /** 是否启用确认模式 */
  confirm: process.env.QUEUE_CONFIRM !== 'false',
}));
