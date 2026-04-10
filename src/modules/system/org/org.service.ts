import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CacheService } from '@/infrastructure/cache/cache.service';

import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreatePositionDto,
  UpdatePositionDto,
  QueryOrgDto,
} from './dto/org.dto';
import {
  CompanyInfo,
  DepartmentInfo,
  PositionInfo,
  OrgTree,
} from './entities/org.entity';

/**
 * 组织架构服务
 *
 * @description
 * 组织架构业务逻辑处理：
 * - 公司、部门、岗位的 CRUD 操作
 * - 组织树构建
 */
@Injectable()
export class OrgService {
  private readonly cacheTtl = 3600; // 1小时

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // ========== 公司服务 ==========

  async getCompanies(query: QueryOrgDto): Promise<CompanyInfo[]> {
    const cacheKey = 'org:companies';
    const cached = await this.cache.get<CompanyInfo[]>(cacheKey);
    if (cached) return cached;

    const where: any = { isDeleted: 0 };
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { code: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    if (query.status !== undefined) where.status = query.status;

    const companies = await this.prisma.baseCompany.findMany({
      where,
      orderBy: { sort: 'asc' },
    });
    const result = companies.map((c) => this.toCompanyInfo(c));
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async getCompanyTree(): Promise<OrgTree[]> {
    const cacheKey = 'org:company-tree';
    const cached = await this.cache.get<OrgTree[]>(cacheKey);
    if (cached) return cached;

    const companies = await this.prisma.baseCompany.findMany({
      where: { isDeleted: 0 },
      orderBy: { sort: 'asc' },
    });
    const result = this.buildTree(companies, 0);
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async getCompany(id: number): Promise<CompanyInfo> {
    const company = await this.prisma.baseCompany.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!company) {
      throw new NotFoundException(`公司不存在: ${id}`);
    }
    return this.toCompanyInfo(company);
  }

  async createCompany(createdBy: bigint, dto: CreateCompanyDto): Promise<CompanyInfo> {
    // 检查编码是否已存在
    const exists = await this.prisma.baseCompany.findUnique({
      where: { code: dto.code, isDeleted: 0 },
    });
    if (exists) {
      throw new BadRequestException(`公司编码已存在: ${dto.code}`);
    }

    const company = await this.prisma.baseCompany.create({
      data: {
        name: dto.name,
        code: dto.code,
        parentId: dto.parentId ?? 0,
        level: dto.parentId ? 2 : 1,
        status: dto.status ?? 1,
        sort: dto.sort ?? 0,
        remark: dto.remark || null,
        createdBy,
      },
    });

    await this.cache.del('org:companies');
    await this.cache.del('org:company-tree');

    return this.toCompanyInfo(company);
  }

  async updateCompany(updatedBy: bigint, id: number, dto: UpdateCompanyDto): Promise<CompanyInfo> {
    const company = await this.prisma.baseCompany.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!company) {
      throw new NotFoundException(`公司不存在: ${id}`);
    }

    // 检查编码是否被其他公司使用
    if (dto.code && dto.code !== company.code) {
      const exists = await this.prisma.baseCompany.findUnique({
        where: { code: dto.code, isDeleted: 0 },
      });
      if (exists && Number(exists.id) !== id) {
        throw new BadRequestException(`公司编码已存在: ${dto.code}`);
      }
    }

    const updates: any = { ...dto };
    delete updates.code; // 编码不允许修改

    const updated = await this.prisma.baseCompany.update({
      where: { id },
      data: {
        ...updates,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    await this.cache.del('org:companies');
    await this.cache.del('org:company-tree');

    return this.toCompanyInfo(updated);
  }

  async removeCompany(id: number): Promise<{ deleted: number }> {
    const company = await this.prisma.baseCompany.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!company) {
      throw new NotFoundException(`公司不存在: ${id}`);
    }

    await this.prisma.baseCompany.update({
      where: { id },
      data: {
        isDeleted: 1,
        deletedBy: company.updatedBy,
        deletedAt: new Date(),
      },
    });

    await this.cache.del('org:companies');
    await this.cache.del('org:company-tree');

    return { deleted: 1 };
  }

  // ========== 部门服务 ==========

  async getDepartments(query: QueryOrgDto): Promise<DepartmentInfo[]> {
    const cacheKey = 'org:departments';
    const cached = await this.cache.get<DepartmentInfo[]>(cacheKey);
    if (cached) return cached;

    const where: any = { isDeleted: 0 };
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { code: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    if (query.status !== undefined) where.status = query.status;

    const departments = await this.prisma.baseDepartment.findMany({
      where,
      orderBy: { sort: 'asc' },
    });
    const result = departments.map((d) => this.toDepartmentInfo(d));
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async getDepartmentTree(companyId?: number): Promise<OrgTree[]> {
    const cacheKey = companyId
      ? `org:department-tree:${companyId}`
      : 'org:department-tree';
    const cached = await this.cache.get<OrgTree[]>(cacheKey);
    if (cached) return cached;

    const where: any = { isDeleted: 0 };
    if (companyId) where.companyId = companyId;

    const departments = await this.prisma.baseDepartment.findMany({
      where,
      orderBy: { sort: 'asc' },
    });
    const result = this.buildTree(departments, 0);
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async getDepartment(id: number): Promise<DepartmentInfo> {
    const department = await this.prisma.baseDepartment.findUnique({
      where: { id, isDeleted: 0 },
      include: { company: true },
    });
    if (!department) {
      throw new NotFoundException(`部门不存在: ${id}`);
    }
    return this.toDepartmentInfo(department);
  }

  async createDepartment(createdBy: bigint, dto: CreateDepartmentDto): Promise<DepartmentInfo> {
    // 检查公司是否存在
    const company = await this.prisma.baseCompany.findUnique({
      where: { id: dto.companyId, isDeleted: 0 },
    });
    if (!company) {
      throw new BadRequestException(`公司不存在: ${dto.companyId}`);
    }

    const department = await this.prisma.baseDepartment.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        parentId: dto.parentId ?? 0,
        leaderId: dto.leaderId || null,
        status: dto.status ?? 1,
        sort: dto.sort ?? 0,
        createdBy,
      },
    });

    await this.cache.del('org:departments');
    await this.cache.del(`org:department-tree:${dto.companyId}`);

    return this.toDepartmentInfo(department);
  }

  async updateDepartment(updatedBy: bigint, id: number, dto: UpdateDepartmentDto): Promise<DepartmentInfo> {
    const department = await this.prisma.baseDepartment.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!department) {
      throw new NotFoundException(`部门不存在: ${id}`);
    }

    const updates: any = { ...dto };
    delete updates.companyId; // 公司不允许修改

    const updated = await this.prisma.baseDepartment.update({
      where: { id },
      data: {
        ...updates,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    await this.cache.del('org:departments');
    await this.cache.del(`org:department-tree:${updated.companyId}`);

    return this.toDepartmentInfo(updated);
  }

  async removeDepartment(id: number): Promise<{ deleted: number }> {
    const department = await this.prisma.baseDepartment.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!department) {
      throw new NotFoundException(`部门不存在: ${id}`);
    }

    await this.prisma.baseDepartment.update({
      where: { id },
      data: {
        isDeleted: 1,
        deletedBy: department.updatedBy,
        deletedAt: new Date(),
      },
    });

    await this.cache.del('org:departments');
    await this.cache.del(`org:department-tree:${department.companyId}`);

    return { deleted: 1 };
  }

  // ========== 岗位服务 ==========

  async getPositions(query: QueryOrgDto): Promise<PositionInfo[]> {
    const cacheKey = 'org:positions';
    const cached = await this.cache.get<PositionInfo[]>(cacheKey);
    if (cached) return cached;

    const where: any = { isDeleted: 0 };
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { code: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    if (query.status !== undefined) where.status = query.status;

    const positions = await this.prisma.basePosition.findMany({
      where,
      orderBy: { sort: 'asc' },
    });
    const result = positions.map((p) => this.toPositionInfo(p));
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async getPosition(id: number): Promise<PositionInfo> {
    const position = await this.prisma.basePosition.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!position) {
      throw new NotFoundException(`岗位不存在: ${id}`);
    }
    return this.toPositionInfo(position);
  }

  async createPosition(createdBy: bigint, dto: CreatePositionDto): Promise<PositionInfo> {
    // 检查编码是否已存在
    const exists = await this.prisma.basePosition.findUnique({
      where: { code: dto.code, isDeleted: 0 },
    });
    if (exists) {
      throw new BadRequestException(`岗位编码已存在: ${dto.code}`);
    }

    const position = await this.prisma.basePosition.create({
      data: {
        name: dto.name,
        code: dto.code,
        status: dto.status ?? 1,
        sort: dto.sort ?? 0,
        createdBy,
      },
    });

    await this.cache.del('org:positions');

    return this.toPositionInfo(position);
  }

  async updatePosition(updatedBy: bigint, id: number, dto: UpdatePositionDto): Promise<PositionInfo> {
    const position = await this.prisma.basePosition.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!position) {
      throw new NotFoundException(`岗位不存在: ${id}`);
    }

    // 检查编码是否被其他岗位使用
    if (dto.code && dto.code !== position.code) {
      const exists = await this.prisma.basePosition.findUnique({
        where: { code: dto.code, isDeleted: 0 },
      });
      if (exists && Number(exists.id) !== id) {
        throw new BadRequestException(`岗位编码已存在: ${dto.code}`);
      }
    }

    const updates: any = { ...dto };
    delete updates.code; // 编码不允许修改

    const updated = await this.prisma.basePosition.update({
      where: { id },
      data: {
        ...updates,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    await this.cache.del('org:positions');

    return this.toPositionInfo(updated);
  }

  async removePosition(id: number): Promise<{ deleted: number }> {
    const position = await this.prisma.basePosition.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!position) {
      throw new NotFoundException(`岗位不存在: ${id}`);
    }

    await this.prisma.basePosition.update({
      where: { id },
      data: {
        isDeleted: 1,
        deletedBy: position.updatedBy,
        deletedAt: new Date(),
      },
    });

    await this.cache.del('org:positions');

    return { deleted: 1 };
  }

  // ========== 树形结构构建 ==========

  private buildTree(nodes: any[], rootParentId: number): any[] {
    const nodeMap = new Map<number, any>();
    const result: any[] = [];

    nodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    nodeMap.forEach((node) => {
      const parent = nodeMap.get(node.parentId);
      if (parent && node.parentId !== rootParentId) {
        parent.children.push(node);
      } else {
        result.push(node);
      }
    });

    return result;
  }

  // ========== 转换方法 ==========

  private toCompanyInfo(data: any): CompanyInfo {
    return {
      id: Number(data.id),
      name: data.name,
      code: data.code,
      parentId: data.parentId,
      level: data.level,
      status: data.status,
      sort: data.sort,
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

  private toDepartmentInfo(data: any): DepartmentInfo {
    return {
      id: Number(data.id),
      companyId: Number(data.companyId),
      name: data.name,
      parentId: data.parentId,
      leaderId: data.leaderId ? Number(data.leaderId) : null,
      status: data.status,
      sort: data.sort,
      remark: data.remark,
      createdBy: data.createdBy ? Number(data.createdBy) : null,
      createdAt: data.createdAt,
      updatedBy: data.updatedBy ? Number(data.updatedBy) : null,
      updatedAt: data.updatedAt,
      isDeleted: data.isDeleted,
      deletedBy: data.deletedBy ? Number(data.deletedBy) : null,
      deletedAt: data.deletedAt,
      companyName: data.company?.name || null,
    };
  }

  private toPositionInfo(data: any): PositionInfo {
    return {
      id: Number(data.id),
      name: data.name,
      code: data.code,
      status: data.status,
      sort: data.sort,
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
}
