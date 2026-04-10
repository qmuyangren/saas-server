import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CacheService } from '@/infrastructure/cache/cache.service';

import { CreateConfigDto, UpdateConfigDto, QueryConfigDto } from './dto/config.dto';
import { ConfigInfo } from './entities/config.entity';

/**
 * 系统配置服务
 *
 * @description
 * 提供系统配置的业务逻辑处理：
 * - 配置的 CRUD 操作
 * - 配置缓存管理
 * - 配置分组管理
 */
@Injectable()
export class ConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly nestConfig: NestConfigService,
  ) {}

  private readonly cacheTtl = 24 * 60 * 60; // 24小时

  /**
   * 获取所有配置
   *
   * @param query 查询参数
   * @returns 配置列表
   */
  async findAll(query?: QueryConfigDto): Promise<ConfigInfo[]> {
    const cacheKey = 'config:all';
    const cached = await this.cache.get<ConfigInfo[]>(cacheKey);
    if (cached) return cached;

    const where: any = { isDeleted: 0 };
    if (query?.group) where.configGroup = query.group;
    if (query?.status !== undefined) where.status = query.status;

    const configs = await this.prisma.cfgSystemConfig.findMany({
      where,
    });

    const result = configs.map((c) => this.toEntity(c));
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  /**
   * 按分组获取配置
   *
   * @param group 配置分组
   * @returns 分组配置列表
   */
  async findByGroup(group: string): Promise<ConfigInfo[]> {
    const cacheKey = `config:group:${group}`;
    const cached = await this.cache.get<ConfigInfo[]>(cacheKey);
    if (cached) return cached;

    const configs = await this.prisma.cfgSystemConfig.findMany({
      where: { configGroup: group, isDeleted: 0 },
    });
    const result = configs.map((c) => this.toEntity(c));
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  /**
   * 获取单个配置
   *
   * @param key 配置键
   * @returns 配置信息
   */
  async findOne(key: string): Promise<ConfigInfo> {
    const cacheKey = `config:${key}`;
    const cached = await this.cache.get<ConfigInfo>(cacheKey);
    if (cached) return cached;

    const config = await this.prisma.cfgSystemConfig.findUnique({
      where: { configKey: key, isDeleted: 0 },
    });

    if (!config) {
      throw new NotFoundException(`配置不存在: ${key}`);
    }

    const result = this.toEntity(config);
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  /**
   * 创建配置
   *
   * @param createdBy 创建人ID
   * @param dto 配置数据
   * @returns 创建的配置
   */
  async create(createdBy: bigint, dto: CreateConfigDto): Promise<ConfigInfo> {
    // 检查配置键是否已存在
    const exists = await this.prisma.cfgSystemConfig.findUnique({
      where: { configKey: dto.configKey, isDeleted: 0 },
    });
    if (exists) {
      throw new BadRequestException(`配置键已存在: ${dto.configKey}`);
    }

    const config = await this.prisma.cfgSystemConfig.create({
      data: {
        configKey: dto.configKey,
        configValue: dto.configValue || '',
        configType: dto.configType,
        configGroup: dto.configGroup,
        name: dto.name,
        remark: dto.remark || null,
        isPublic: dto.isPublic ?? 0,
        status: dto.status ?? 1,
        createdBy,
      },
    });

    // 清除缓存
    await this.cache.del('config:all');

    return this.toEntity(config);
  }

  /**
   * 更新配置
   *
   * @param updatedBy 更新人ID
   * @param key 配置键
   * @param dto 配置数据
   * @returns 更新后的配置
   */
  async update(updatedBy: bigint, key: string, dto: UpdateConfigDto): Promise<ConfigInfo> {
    const config = await this.prisma.cfgSystemConfig.findUnique({
      where: { configKey: key, isDeleted: 0 },
    });

    if (!config) {
      throw new NotFoundException(`配置不存在: ${key}`);
    }

    const updated = await this.prisma.cfgSystemConfig.update({
      where: { configKey: key },
      data: {
        configValue: dto.configValue ?? config.configValue,
        configType: dto.configType ?? config.configType,
        configGroup: dto.configGroup ?? config.configGroup,
        name: dto.name ?? config.name,
        remark: dto.remark ?? config.remark,
        isPublic: dto.isPublic ?? config.isPublic,
        status: dto.status ?? config.status,
        updatedBy,
      },
    });

    // 清除缓存
    await this.cache.del('config:all');
    await this.cache.del(`config:${key}`);
    await this.cache.del('config:public');

    return this.toEntity(updated);
  }

  /**
   * 删除配置（逻辑删除）
   *
   * @param key 配置键
   * @returns 删除数量
   */
  async remove(key: string): Promise<{ deleted: number }> {
    const config = await this.prisma.cfgSystemConfig.findUnique({
      where: { configKey: key, isDeleted: 0 },
    });

    if (!config) {
      throw new NotFoundException(`配置不存在: ${key}`);
    }

    await this.prisma.cfgSystemConfig.update({
      where: { configKey: key },
      data: {
        isDeleted: 1,
        deletedBy: config.updatedBy,
        deletedAt: new Date(),
      },
    });

    // 清除缓存
    await this.cache.del('config:all');
    await this.cache.del(`config:${key}`);
    await this.cache.del('config:public');

    return { deleted: 1 };
  }

  /**
   * 获取公共配置
   *
   * @returns 公共配置对象
   */
  async getPublic(): Promise<Record<string, string>> {
    const cacheKey = 'config:public';
    const cached = await this.cache.get<Record<string, string>>(cacheKey);
    if (cached) return cached;

    const configs = await this.prisma.cfgSystemConfig.findMany({
      where: { isPublic: 1, status: 1, isDeleted: 0 },
      select: { configKey: true, configValue: true },
    });

    const result = configs.reduce((acc, c) => {
      acc[c.configKey] = c.configValue || '';
      return acc;
    }, {} as Record<string, string>);

    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  /**
   * 获取配置值
   *
   * @param key 配置键
   * @returns 配置值
   */
  async getValue(key: string): Promise<string | null> {
    const config = await this.findOne(key);
    return config.configValue;
  }

  /**
   * 获取配置值（可设置默认值）
   *
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 配置值
   */
  async getValueOrDefault(key: string, defaultValue: string = ''): Promise<string> {
    const value = await this.getValue(key);
    return value ?? defaultValue;
  }

  /**
   * 将 Prisma 模型转换为实体
   *
   * @param data Prisma 模型
   * @returns 实体对象
   */
  private toEntity(data: any): ConfigInfo {
    return {
      id: Number(data.id),
      configKey: data.configKey,
      configValue: data.configValue,
      configType: data.configType,
      configGroup: data.configGroup,
      name: data.name,
      remark: data.remark,
      isPublic: data.isPublic,
      status: data.status,
      createdBy: data.createdBy ? Number(data.createdBy) : null,
      createdAt: data.createdAt,
      updatedBy: data.updatedBy ? Number(data.updatedBy) : null,
      updatedAt: data.updatedAt,
      isDeleted: data.isDeleted,
      deletedBy: data.deletedBy ? Number(data.deletedBy) : null,
      deletedAt: data.deletedAt,
    };
  }
}
