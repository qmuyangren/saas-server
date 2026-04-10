/**
 * 缓存键常量定义
 *
 * @description
 * 统一管理 Redis 缓存键的命名规范，避免硬编码字符串。
 * 使用工厂函数生成动态键，支持参数替换。
 *
 * 命名规范：`模块:类型:标识`
 * 例如：`user:profile:123`、`dict:type:gender`
 */

/** 用户模块缓存键 */
export const USER_CACHE = {
  /** 用户资料缓存 */
  profile: (id: number) => `user:profile:${id}`,
  /** 用户角色缓存 */
  roles: (id: number) => `user:roles:${id}`,
  /** 用户权限缓存 */
  permissions: (id: number) => `user:permissions:${id}`,
  /** 用户会话缓存 */
  session: (id: number) => `user:session:${id}`,
  /** 用户登录失败次数 */
  loginFail: (email: string) => `user:login:fail:${email}`,
} as const;

/** 字典模块缓存键 */
export const DICT_CACHE = {
  /** 字典类型列表 */
  typeList: 'dict:type:list',
  /** 字典数据（按类型） */
  data: (type: string) => `dict:data:${type}`,
} as const;

/** 配置模块缓存键 */
export const CONFIG_CACHE = {
  /** 系统配置 */
  system: (key: string) => `config:system:${key}`,
  /** 全部配置 */
  all: 'config:system:all',
} as const;

/** 验证码模块缓存键 */
export const VERIFY_CACHE = {
  /** 重置密码验证码 */
  resetCode: (email: string) => `verify:reset:code:${email}`,
  /** 注册验证码 */
  registerCode: (email: string) => `verify:register:code:${email}`,
  /** 每日发送次数 */
  dailyCount: (email: string) => `verify:daily:count:${email}`,
  /** 最后发送时间 */
  lastSend: (email: string) => `verify:last:send:${email}`,
} as const;

/** 限流模块缓存键 */
export const RATE_LIMIT_CACHE = {
  /** 接口限流 */
  api: (ip: string, url: string) => `rate:limit:${ip}:${url}`,
  /** 登录限流 */
  login: (ip: string) => `rate:limit:login:${ip}`,
} as const;

/** 分布式锁缓存键 */
export const LOCK_CACHE = {
  /** 用户操作锁 */
  userAction: (userId: number, action: string) =>
    `lock:user:${userId}:${action}`,
  /** 订单处理锁 */
  orderProcess: (orderId: number) => `lock:order:${orderId}`,
} as const;

/** 租户模块缓存键 */
export const TENANT_CACHE = {
  /** 租户配置 */
  config: (tenantId: number) => `tenant:config:${tenantId}`,
  /** 租户业务列表 */
  businesses: (tenantId: number) => `tenant:businesses:${tenantId}`,
  /** 用户租户列表 */
  userTenants: (userId: string) => `user:tenants:${userId}`,
} as const;

/** 业务模块缓存键 */
export const BUSINESS_CACHE = {
  /** 业务详情 */
  detail: (businessId: number) => `business:detail:${businessId}`,
  /** 业务应用列表 */
  apps: (businessId: number) => `business:apps:${businessId}`,
} as const;

/** 应用模块缓存键 */
export const APP_CACHE = {
  /** 应用详情 */
  detail: (appId: number) => `app:detail:${appId}`,
  /** 应用客户端配置 */
  client: (appId: number, clientId: string) => `app:client:${appId}:${clientId}`,
} as const;
