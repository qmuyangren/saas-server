/**
 * HTTP 状态码常量定义
 *
 * @description
 * 定义标准 HTTP 状态码，用于响应状态标识。
 * 按类别分组：1xx 信息、2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务器错误。
 */

/** 1xx 信息响应 */
export const HTTP_1XX = {
  /** 继续 - 请求已接收，继续处理 */
  CONTINUE: 100,
  /** 切换协议 - 服务器同意切换协议 */
  SWITCHING_PROTOCOLS: 101,
  /** 处理中 - 服务器已接受请求，但尚未完成 */
  PROCESSING: 102,
} as const;

/** 2xx 成功响应 */
export const HTTP_2XX = {
  /** 成功 - 请求已成功处理 */
  OK: 200,
  /** 已创建 - 请求成功并创建了新资源 */
  CREATED: 201,
  /** 已接受 - 请求已接受，但尚未处理完成 */
  ACCEPTED: 202,
  /** 非授权信息 - 来自非权威源的信息 */
  NON_AUTHORITATIVE_INFORMATION: 203,
  /** 无内容 - 请求成功，但无返回内容 */
  NO_CONTENT: 204,
  /** 重置内容 - 请求成功，需重置文档视图 */
  RESET_CONTENT: 205,
  /** 部分内容 - 服务器成功处理了部分 GET 请求 */
  PARTIAL_CONTENT: 206,
} as const;

/** 3xx 重定向响应 */
export const HTTP_3XX = {
  /** 多选择 - 请求的资源有多个位置可选 */
  MULTIPLE_CHOICES: 300,
  /** 永久移动 - 请求的资源已被永久移动到新位置 */
  MOVED_PERMANENTLY: 301,
  /** 临时移动 - 请求的资源临时移动到其他位置 */
  FOUND: 302,
  /** 参见其他 - 请求的资源可在其他 URI 下找到 */
  SEE_OTHER: 303,
  /** 未修改 - 资源未修改，可使用缓存 */
  NOT_MODIFIED: 304,
  /** 临时重定向 - 请求的资源临时移动到其他位置 */
  TEMPORARY_REDIRECT: 307,
  /** 永久重定向 - 请求的资源永久移动到其他位置 */
  PERMANENT_REDIRECT: 308,
} as const;

/** 4xx 客户端错误响应 */
export const HTTP_4XX = {
  /** 错误请求 - 服务器无法理解请求 */
  BAD_REQUEST: 400,
  /** 未授权 - 需要身份认证 */
  UNAUTHORIZED: 401,
  /** 需要付费 - 需要付费才能访问 */
  PAYMENT_REQUIRED: 402,
  /** 禁止访问 - 服务器拒绝请求 */
  FORBIDDEN: 403,
  /** 未找到 - 服务器找不到请求的资源 */
  NOT_FOUND: 404,
  /** 方法不允许 - 请求方法不被允许 */
  METHOD_NOT_ALLOWED: 405,
  /** 不可接受 - 请求的资源不符合 Accept 头要求 */
  NOT_ACCEPTABLE: 406,
  /** 需要代理认证 - 需要代理服务器认证 */
  PROXY_AUTHENTICATION_REQUIRED: 407,
  /** 请求超时 - 客户端未在服务器等待时间内完成请求 */
  REQUEST_TIMEOUT: 408,
  /** 冲突 - 请求与资源当前状态冲突 */
  CONFLICT: 409,
  /** 已删除 - 资源已被删除 */
  GONE: 410,
  /** 需要长度 - 服务器需要 Content-Length 头 */
  LENGTH_REQUIRED: 411,
  /** 前提条件失败 - 请求头中的前提条件不满足 */
  PRECONDITION_FAILED: 412,
  /** 负载过大 - 请求体过大，服务器拒绝处理 */
  PAYLOAD_TOO_LARGE: 413,
  /** URI 过长 - 请求的 URI 过长 */
  URI_TOO_LONG: 414,
  /** 不支持的媒体类型 - 请求的媒体类型不被支持 */
  UNSUPPORTED_MEDIA_TYPE: 415,
  /** 范围不满足 - 请求的范围不满足资源要求 */
  RANGE_NOT_SATISFIABLE: 416,
  /** 期望失败 - Expect 请求头不满足 */
  EXPECTATION_FAILED: 417,
  /** 处理失败 - 服务器无法满足请求的 Expect 头 */
  UNPROCESSABLE_ENTITY: 422,
  /** 锁定 - 资源已被锁定 */
  LOCKED: 423,
  /** 依赖失败 - 请求依赖的其他请求失败 */
  FAILED_DEPENDENCY: 424,
  /** 升级需要 - 客户端需要升级到 TLS */
  UPGRADE_REQUIRED: 426,
  /** 前置条件需要 - 请求需要前置条件 */
  PRECONDITION_REQUIRED: 428,
  /** 请求过多 - 客户端在给定时间内发送了太多请求 */
  TOO_MANY_REQUESTS: 429,
  /** 请求头过大 - 请求头过大 */
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
} as const;

/** 5xx 服务器错误响应 */
export const HTTP_5XX = {
  /** 服务器内部错误 - 服务器遇到意外情况 */
  INTERNAL_SERVER_ERROR: 500,
  /** 未实现 - 服务器不支持请求的功能 */
  NOT_IMPLEMENTED: 501,
  /** 网关错误 - 网关或代理收到无效响应 */
  BAD_GATEWAY: 502,
  /** 服务不可用 - 服务器暂时无法处理请求 */
  SERVICE_UNAVAILABLE: 503,
  /** 网关超时 - 网关或代理未及时收到上游响应 */
  GATEWAY_TIMEOUT: 504,
  /** HTTP 版本不支持 - 服务器不支持请求的 HTTP 版本 */
  HTTP_VERSION_NOT_SUPPORTED: 505,
  /** 变体协商 - 服务器无法完成内容协商 */
  VARIANT_ALSO_NEGOTIATES: 506,
  /** 存储空间不足 - 服务器存储空间不足 */
  INSUFFICIENT_STORAGE: 507,
  /** 循环检测 - 服务器检测到无限循环 */
  LOOP_DETECTED: 508,
  /** 带宽限制 - 服务器带宽限制 */
  BANDWIDTH_LIMIT_EXCEEDED: 509,
  /** 未扩展 - 需要进一步扩展才能处理请求 */
  NOT_EXTENDED: 510,
  /** 网络认证需要 - 需要网络认证 */
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;
