/**
 * API 响应类型定义
 *
 * @description
 * 定义系统统一的 API 响应格式，包含状态码、消息和数据。
 * 所有接口返回值都应遵循此格式，便于前端统一处理。
 *
 * @example
 * ```typescript
 * // 成功响应
 * new ApiResponse(200, '操作成功', { id: 1, name: '张三' });
 *
 * // 使用静态方法
 * ApiResponse.success({ id: 1 });
 * ApiResponse.error(1001, '参数错误');
 * ```
 */
export class ApiResponse<T = any> {
  /** 状态码，200 表示成功 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data?: T;

  constructor(code = 200, message = 'success', data?: T) {
    this.code = code;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }

  /**
   * 创建成功响应
   *
   * @param data - 响应数据
   * @param message - 响应消息
   * @returns 成功响应对象
   */
  static success<T>(data?: T, message = 'success'): ApiResponse<T> {
    return new ApiResponse(200, message, data);
  }

  /**
   * 创建错误响应
   *
   * @param code - 错误码
   * @param message - 错误消息
   * @returns 错误响应对象
   */
  static error(code: number, message: string): ApiResponse {
    return new ApiResponse(code, message);
  }
}

/**
 * 分页响应类型
 *
 * @description
 * 定义分页查询的响应格式，包含数据列表、总数、页码等信息。
 * 适用于所有需要分页的列表接口。
 *
 * @example
 * ```typescript
 * const response = new PaginatedResponse(users, 100, 1, 20);
 * // response.totalPages = 5
 * ```
 */
export class PaginatedResponse<T> {
  /** 当前页数据列表 */
  list: T[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 总页数 */
  totalPages: number;

  constructor(list: T[], total: number, page: number, limit: number) {
    this.list = list;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}

/**
 * 分页查询参数
 *
 * @description
 * 定义分页查询的请求参数格式。
 * 所有分页接口都应使用此格式接收参数。
 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page?: number;
  /** 每页数量 */
  limit?: number;
}
