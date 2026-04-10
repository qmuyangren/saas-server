import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CacheService } from '@/infrastructure/cache/cache.service';

import {
  QueryDictTypeDto,
  CreateDictTypeDto,
  UpdateDictTypeDto,
  QueryDictDataDto,
  CreateDictDataDto,
  UpdateDictDataDto,
} from './dto/dict.dto';
import { DictTypeInfo, DictDataInfo } from './entities/dict.entity';

/**
 * 字典服务
 *
 * @description
 * 字典业务逻辑处理：
 * - 字典类型 CRUD 操作
 * - 字典数据 CRUD 操作
 * - 字典数据缓存
 */
@Injectable()
export class DictService {
  private readonly cacheTtl = 3600; // 1小时

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // ========== 字典类型服务 ==========

  async getDictTypes(query: QueryDictTypeDto): Promise<{ list: DictTypeInfo[]; total: number }> {
    const where: any = { isDeleted: 0 };
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { code: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    if (query.status !== undefined) where.status = query.status;

    const [list, total] = await this.prisma.$transaction([
      this.prisma.cfgDictType.findMany({
        where,
        orderBy: { sort: 'asc' },
        skip: query?.page && query.pageSize ? (query.page - 1) * query.pageSize : undefined,
        take: query?.pageSize ?? undefined,
      }),
      this.prisma.cfgDictType.count({ where }),
    ]);

    return {
      list: list.map((t) => this.toDictTypeInfo(t)),
      total,
    };
  }

  async getDictType(id: number): Promise<DictTypeInfo> {
    const cacheKey = `dict:type:${id}`;
    const cached = await this.cache.get<DictTypeInfo>(cacheKey);
    if (cached) return cached;

    const type = await this.prisma.cfgDictType.findUnique({
      where: { id, isDeleted: 0 },
    });

    if (!type) {
      throw new NotFoundException(`字典类型不存在: ${id}`);
    }

    const result = this.toDictTypeInfo(type);
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async createDictType(createdBy: bigint, dto: CreateDictTypeDto): Promise<DictTypeInfo> {
    // 检查编码是否已存在
    const exists = await this.prisma.cfgDictType.findUnique({
      where: { code: dto.code, isDeleted: 0 },
    });
    if (exists) {
      throw new BadRequestException(`字典类型编码已存在: ${dto.code}`);
    }

    const type = await this.prisma.cfgDictType.create({
      data: {
        code: dto.code,
        name: dto.name,
        status: dto.status ?? 1,
        remark: dto.remark || null,
        createdBy,
      },
    });

    await this.cache.del('dict:types');
    await this.cache.del(`dict:type:${type.id}`);

    return this.toDictTypeInfo(type);
  }

  async updateDictType(updatedBy: bigint, id: number, dto: UpdateDictTypeDto): Promise<DictTypeInfo> {
    const type = await this.prisma.cfgDictType.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!type) {
      throw new NotFoundException(`字典类型不存在: ${id}`);
    }

    const updates: any = { ...dto };
    delete updates.code; // 编码不允许修改

    const updated = await this.prisma.cfgDictType.update({
      where: { id },
      data: {
        ...updates,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    await this.cache.del('dict:types');
    await this.cache.del(`dict:type:${id}`);

    return this.toDictTypeInfo(updated);
  }

  async removeDictType(id: number): Promise<{ deleted: number }> {
    const type = await this.prisma.cfgDictType.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!type) {
      throw new NotFoundException(`字典类型不存在: ${id}`);
    }

    // 检查是否有字典数据关联
    const count = await this.prisma.cfgDictData.count({
      where: { dictType: type.code, isDeleted: 0 },
    });
    if (count > 0) {
      throw new BadRequestException(`字典类型下有 ${count} 条数据，无法删除`);
    }

    await this.prisma.cfgDictType.update({
      where: { id },
      data: {
        isDeleted: 1,
        deletedBy: type.updatedBy ?? undefined,
        deletedAt: new Date(),
      },
    });

    await this.cache.del('dict:types');
    await this.cache.del(`dict:type:${id}`);

    return { deleted: 1 };
  }

  // ========== 字典数据服务 ==========

  async getDictDataList(query: QueryDictDataDto): Promise<{ list: DictDataInfo[]; total: number }> {
    const where: any = {};
    if (query.dictType) {
      where.dictType = query.dictType;
    }
    if (query.keyword) {
      where.OR = [
        { label: { contains: query.keyword, mode: 'insensitive' } },
        { value: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    if (query.status !== undefined) where.status = query.status;

    const [list, total] = await this.prisma.$transaction([
      this.prisma.cfgDictData.findMany({
        where,
        orderBy: { sort: 'asc' },
        skip: query?.page && query.pageSize ? (query.page - 1) * query.pageSize : undefined,
        take: query?.pageSize ?? undefined,
      }),
      this.prisma.cfgDictData.count({ where }),
    ]);

    return {
      list: list.map((d) => this.toDictDataInfo(d)),
      total,
    };
  }

  async getDictDataByType(dictType: string): Promise<DictDataInfo[]> {
    const cacheKey = `dict:data:${dictType}`;
    const cached = await this.cache.get<DictDataInfo[]>(cacheKey);
    if (cached) return cached;

    const data = await this.prisma.cfgDictData.findMany({
      where: { dictType },
      orderBy: { sort: 'asc' },
    });

    const result = data.map((d) => this.toDictDataInfo(d));
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async getDictData(id: number): Promise<DictDataInfo> {
    const cacheKey = `dict:data:${id}`;
    const cached = await this.cache.get<DictDataInfo>(cacheKey);
    if (cached) return cached;

    const data = await this.prisma.cfgDictData.findUnique({
      where: { id },
    });

    if (!data) {
      throw new NotFoundException(`字典数据不存在: ${id}`);
    }

    const result = this.toDictDataInfo(data);
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async createDictData(createdBy: bigint, dto: CreateDictDataDto): Promise<DictDataInfo> {
    // 检查字典类型是否存在
    const type = await this.prisma.cfgDictType.findUnique({
      where: { code: dto.dictType, isDeleted: 0 },
    });
    if (!type) {
      throw new BadRequestException(`字典类型不存在: ${dto.dictType}`);
    }

    // 检查值是否已存在
    const exists = await this.prisma.cfgDictData.findFirst({
      where: {
        dictType: dto.dictType,
        value: dto.value,
      },
    });
    if (exists) {
      throw new BadRequestException(`字典值已存在: ${dto.value}`);
    }

    const data = await this.prisma.cfgDictData.create({
      data: {
        dictType: dto.dictType,
        label: dto.label,
        value: dto.value,
        sort: dto.sort ?? 0,
        status: dto.status ?? 1,
        cssClass: dto.cssClass || null,
        isDefault: dto.isDefault ?? 0,
        description: dto.description || null,
        createdBy,
      },
    });

    await this.cache.del(`dict:data:${dto.dictType}`);

    return this.toDictDataInfo(data);
  }

  async updateDictData(updatedBy: bigint, id: number, dto: UpdateDictDataDto): Promise<DictDataInfo> {
    const data = await this.prisma.cfgDictData.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException(`字典数据不存在: ${id}`);
    }

    // 检查值是否被其他数据使用
    if (dto.value && dto.value !== data.value) {
      const exists = await this.prisma.cfgDictData.findFirst({
        where: {
          dictType: data.dictType,
          value: dto.value,
        },
      });
      if (exists && Number(exists.id) !== id) {
        throw new BadRequestException(`字典值已存在: ${dto.value}`);
      }
    }

    const updates: any = { ...dto };

    const updated = await this.prisma.cfgDictData.update({
      where: { id },
      data: {
        ...updates,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    await this.cache.del(`dict:data:${updated.dictType}`);

    return this.toDictDataInfo(updated);
  }

  async removeDictData(id: number): Promise<{ deleted: number }> {
    const data = await this.prisma.cfgDictData.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException(`字典数据不存在: ${id}`);
    }

    await this.prisma.cfgDictData.update({
      where: { id },
      data: {
        isDeleted: 1,
        deletedBy: data.updatedBy ?? undefined,
        deletedAt: new Date(),
      },
    });

    await this.cache.del(`dict:data:${data.dictType}`);

    return { deleted: 1 };
  }

  // ========== 转换方法 ==========

  private toDictTypeInfo(data: any): DictTypeInfo {
    return {
      id: Number(data.id),
      code: data.code,
      name: data.name,
      isTree: 0, // CfgDictType 无此字段，默认为 0
      type: 1, // CfgDictType 无此字段，默认为 1
      status: data.status,
      remark: data.remark,
      createdBy: data.createdBy ? Number(data.createdBy) : null,
      createdAt: data.createdAt,
      updatedBy: data.updatedBy ? Number(data.updatedBy) : null,
      updatedAt: data.updatedAt,
      isDeleted: data.isDeleted,
      deletedBy: data.deletedBy ? Number(data.deletedBy) : null,
      deletedAt: data.deletedAt,
    };
  }

  private toDictDataInfo(data: any): DictDataInfo {
    return {
      id: Number(data.id),
      dictType: data.dictType,
      label: data.label,
      value: data.value,
      sort: data.sort,
      status: data.status,
      cssClass: data.cssClass,
      isDefault: data.isDefault,
      description: data.description,
      createdBy: data.createdBy ? Number(data.createdBy) : null,
      createdAt: data.createdAt,
      updatedBy: data.updatedBy ? Number(data.updatedBy) : null,
      updatedAt: data.updatedAt,
      isDeleted: 0,
      deletedBy: null,
      deletedAt: null,
    };
  }
}
