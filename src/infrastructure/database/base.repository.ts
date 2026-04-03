import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * 基础仓储类 - 提供通用的 CRUD 操作
 *
 * @description
 * 基于 Prisma 的通用仓储实现，封装常用的增删改查操作。
 * 业务模块的仓储类可继承此类，减少重复代码。
 * 支持软删除、分页查询、条件过滤等常用功能。
 *
 * 使用方式：
 * 1. 继承 BaseRepository 并指定实体类型
 * 2. 在子类构造函数中调用 super(prisma, modelName)
 * 3. 按需重写或扩展父类方法
 *
 * @example
 * ```typescript
 * // 定义用户仓储
 * @Injectable()
 * export class UserRepository extends BaseRepository {
 *   constructor(prisma: PrismaService) {
 *     super(prisma, 'baseUser');
 *   }
 *
 *   // 扩展自定义方法
 *   async findByEmail(email: string) {
 *     return this.prisma.baseUser.findFirst({ where: { email } });
 *   }
 * }
 *
 * // 在 Service 中使用
 * const user = await this.userRepository.findById(1);
 * const users = await this.userRepository.findAll({ page: 1, limit: 20 });
 * ```
 */
@Injectable()
export class BaseRepository<T = any> {
  protected readonly logger = new Logger(BaseRepository.name);

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  /**
   * 根据 ID 查找记录
   *
   * @param id - 记录 ID
   * @returns 找到的记录，不存在返回 null
   */
  async findById(id: number): Promise<T | null> {
    return (this.prisma as any)[this.modelName].findUnique({
      where: { id },
    });
  }

  /**
   * 查询所有记录，支持分页和过滤
   *
   * @param options - 查询选项
   * @param options.where - 查询条件
   * @param options.orderBy - 排序规则
   * @param options.page - 页码
   * @param options.limit - 每页数量
   * @returns 记录列表和总数
   */
  async findAll(options?: {
    where?: any;
    orderBy?: any;
    page?: number;
    limit?: number;
  }): Promise<{ list: T[]; total: number }> {
    const { where, orderBy, page, limit } = options || {};
    const skip = page && limit ? (page - 1) * limit : undefined;

    const [list, total] = await Promise.all([
      (this.prisma as any)[this.modelName].findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      (this.prisma as any)[this.modelName].count({ where }),
    ]);

    return { list, total };
  }

  /**
   * 创建新记录
   *
   * @param data - 记录数据
   * @returns 创建的记录
   */
  async create(data: Partial<T>): Promise<T> {
    return (this.prisma as any)[this.modelName].create({
      data,
    });
  }

  /**
   * 更新记录
   *
   * @param id - 记录 ID
   * @param data - 更新数据
   * @returns 更新后的记录
   */
  async update(id: number, data: Partial<T>): Promise<T> {
    return (this.prisma as any)[this.modelName].update({
      where: { id },
      data,
    });
  }

  /**
   * 删除记录（物理删除）
   *
   * @param id - 记录 ID
   */
  async remove(id: number): Promise<void> {
    await (this.prisma as any)[this.modelName].delete({
      where: { id },
    });
  }

  /**
   * 软删除记录（设置 isDeleted = 1）
   *
   * @param id - 记录 ID
   * @returns 更新后的记录
   */
  async softDelete(id: number): Promise<T> {
    return (this.prisma as any)[this.modelName].update({
      where: { id },
      data: { isDeleted: 1 },
    });
  }

  /**
   * 批量创建记录
   *
   * @param dataList - 记录数据数组
   * @returns 创建的记录数组
   */
  async createMany(dataList: Partial<T>[]): Promise<number> {
    const result = await (this.prisma as any)[this.modelName].createMany({
      data: dataList,
    });
    return result.count;
  }

  /**
   * 批量更新记录
   *
   * @param where - 查询条件
   * @param data - 更新数据
   * @returns 更新的记录数
   */
  async updateMany(where: any, data: Partial<T>): Promise<number> {
    const result = await (this.prisma as any)[this.modelName].updateMany({
      where,
      data,
    });
    return result.count;
  }

  /**
   * 批量删除记录
   *
   * @param where - 查询条件
   * @returns 删除的记录数
   */
  async deleteMany(where: any): Promise<number> {
    const result = await (this.prisma as any)[this.modelName].deleteMany({
      where,
    });
    return result.count;
  }

  /**
   * 统计记录数
   *
   * @param where - 查询条件
   * @returns 记录数
   */
  async count(where?: any): Promise<number> {
    return (this.prisma as any)[this.modelName].count({ where });
  }

  /**
   * 检查记录是否存在
   *
   * @param where - 查询条件
   * @returns 是否存在
   */
  async exists(where: any): Promise<boolean> {
    const count = await (this.prisma as any)[this.modelName].count({ where });
    return count > 0;
  }
}
