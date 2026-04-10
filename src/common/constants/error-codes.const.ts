/**
 * 错误码常量定义
 *
 * @description
 * 定义系统中所有业务错误码，按模块分段管理：
 * - 0: 成功
 * - 1000-1999: 客户端错误（请求参数、格式等）
 * - 2000-2999: 业务错误（数据冲突、状态异常等）
 * - 3000-3999: 认证错误（Token、登录状态等）
 * - 4000-4999: 验证码错误（发送频率、有效性等）
 * - 5000-5999: 服务器错误（数据库、缓存、第三方等）
 */

/** 通用成功码 */
export const SUCCESS = 200;

/** 通用错误码别名 */
export const ErrorCode = {
  BAD_REQUEST: 1000,
  UNAUTHORIZED: 1001,
  FORBIDDEN: 1002,
  NOT_FOUND: 1003,
  CONFLICT: 1004,
  VALIDATION_ERROR: 1005,
  DUPLICATE_ENTRY: 2001,
  RECORD_NOT_FOUND: 2002,
  HAS_RELATED_DATA: 2003,
  INVALID_OPERATION: 2004,
  INVALID_TOKEN: 3001,
  TOKEN_EXPIRED: 3002,
  INVALID_CREDENTIALS: 3003,
  ACCOUNT_LOCKED: 3004,
  INVALID_EMAIL_FORMAT: 4001,
  EMAIL_NOT_FOUND: 4003,
  RATE_LIMIT_EXCEEDED: 4004,
  INVALID_CODE: 4005,
  CODE_EXPIRED: 4006,
  INTERNAL_ERROR: 5000,
  DATABASE_ERROR: 5001,
  REDIS_ERROR: 5002,
} as const;

/** 客户端错误段 1000-1999 */

/** 客户端错误段 1000-1999 */
export const CLIENT_ERROR = {
  /** 请求参数错误 */
  BAD_REQUEST: 1000,
  /** 未授权/未登录 */
  UNAUTHORIZED: 1001,
  /** 权限不足 */
  FORBIDDEN: 1002,
  /** 资源不存在 */
  NOT_FOUND: 1003,
  /** 请求冲突 */
  CONFLICT: 1004,
  /** 参数校验失败 */
  VALIDATION_ERROR: 1005,
  /** 请求方法不允许 */
  METHOD_NOT_ALLOWED: 1006,
  /** 请求体过大 */
  PAYLOAD_TOO_LARGE: 1007,
  /** 请求频率过高 */
  TOO_MANY_REQUESTS: 1008,
} as const;

/** 业务错误段 2000-2999 */
export const BUSINESS_ERROR = {
  /** 数据已存在/重复提交 */
  DUPLICATE_ENTRY: 2001,
  /** 记录不存在 */
  RECORD_NOT_FOUND: 2002,
  /** 存在关联数据无法删除 */
  HAS_RELATED_DATA: 2003,
  /** 操作不允许 */
  INVALID_OPERATION: 2004,
  /** 数据状态异常 */
  INVALID_STATUS: 2005,
  /** 余额不足 */
  INSUFFICIENT_BALANCE: 2006,
  /** 库存不足 */
  INSUFFICIENT_STOCK: 2007,
  /** 超过限制 */
  EXCEED_LIMIT: 2008,
  /** 依赖服务不可用 */
  DEPENDENCY_UNAVAILABLE: 2009,
} as const;

/** 认证错误段 3000-3999 */
export const AUTH_ERROR = {
  /** Token 无效 */
  INVALID_TOKEN: 3001,
  /** Token 已过期 */
  TOKEN_EXPIRED: 3002,
  /** 用户名或密码错误 */
  INVALID_CREDENTIALS: 3003,
  /** 账号已被锁定/禁用 */
  ACCOUNT_LOCKED: 3004,
  /** 账号已注销 */
  ACCOUNT_DELETED: 3005,
  /** 登录已过期 */
  SESSION_EXPIRED: 3006,
  /** 异地登录 */
  LOGIN_FROM_DIFFERENT_LOCATION: 3007,
  /** 密码强度不足 */
  PASSWORD_TOO_WEAK: 3008,
} as const;

/** 验证码错误段 4000-4999 */
export const CODE_ERROR = {
  /** 邮箱格式错误 */
  INVALID_EMAIL_FORMAT: 4001,
  /** 手机号格式错误 */
  INVALID_PHONE_FORMAT: 4002,
  /** 邮箱/手机号未注册 */
  EMAIL_NOT_FOUND: 4003,
  /** 发送频率过高 */
  RATE_LIMIT_EXCEEDED: 4004,
  /** 验证码错误 */
  INVALID_CODE: 4005,
  /** 验证码已过期 */
  CODE_EXPIRED: 4006,
  /** 今日发送次数已达上限 */
  DAILY_LIMIT_EXCEEDED: 4007,
} as const;

/** 服务器错误段 5000-5999 */
export const SERVER_ERROR = {
  /** 服务器内部错误 */
  INTERNAL_ERROR: 5000,
  /** 数据库操作失败 */
  DATABASE_ERROR: 5001,
  /** Redis 操作失败 */
  REDIS_ERROR: 5002,
  /** 文件操作失败 */
  FILE_ERROR: 5003,
  /** 第三方服务调用失败 */
  THIRD_PARTY_ERROR: 5004,
  /** 消息队列操作失败 */
  QUEUE_ERROR: 5005,
  /** 服务超时 */
  SERVICE_TIMEOUT: 5006,
  /** 服务降级 */
  SERVICE_DEGRADED: 5007,
} as const;
