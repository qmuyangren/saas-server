import { PaginationDefaults } from '../constants';

/**
 * 分页工具函数
 *
 * @description
 * 封装分页查询相关的计算逻辑，包括偏移量计算、总页数计算、分页参数校验等。
 * 统一分页处理逻辑，避免在业务代码中重复实现。
 *
 * @example
 * ```typescript
 * // 计算分页参数
 * const { page, limit, skip } = PaginationUtil.normalize(query);
 *
 * // 计算总页数
 * const totalPages = PaginationUtil.getTotalPages(100, 20); // 5
 *
 * // 构建分页响应
 * const response = PaginationUtil.buildResponse(list, total, page, limit);
 * ```
 */
export class PaginationUtil {
  /**
   * 标准化分页参数
   *
   * @param params - 原始分页参数
   * @returns 标准化后的分页参数
   */
  static normalize(params: { page?: number; limit?: number }) {
    const page = Math.max(1, params.page ?? PaginationDefaults.PAGE);
    const limit = Math.min(
      Math.max(1, params.limit ?? PaginationDefaults.LIMIT),
      PaginationDefaults.MAX_LIMIT,
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * 计算总页数
   *
   * @param total - 总记录数
   * @param limit - 每页记录数
   * @returns 总页数
   */
  static getTotalPages(total: number, limit: number): number {
    if (limit <= 0) {
      return 0;
    }
    return Math.ceil(total / limit);
  }

  /**
   * 判断是否有下一页
   *
   * @param currentPage - 当前页码
   * @param totalPages - 总页数
   * @returns 是否有下一页
   */
  static hasNextPage(currentPage: number, totalPages: number): boolean {
    return currentPage < totalPages;
  }

  /**
   * 判断是否有上一页
   *
   * @param currentPage - 当前页码
   * @returns 是否有上一页
   */
  static hasPrevPage(currentPage: number): boolean {
    return currentPage > 1;
  }

  /**
   * 构建分页响应
   *
   * @param list - 数据列表
   * @param total - 总记录数
   * @param page - 当前页码
   * @param limit - 每页记录数
   * @returns 分页响应对象
   */
  static buildResponse<T>(
    list: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      list,
      total,
      page,
      limit,
      totalPages: this.getTotalPages(total, limit),
      hasNext: this.hasNextPage(page, this.getTotalPages(total, limit)),
      hasPrev: this.hasPrevPage(page),
    };
  }
}
