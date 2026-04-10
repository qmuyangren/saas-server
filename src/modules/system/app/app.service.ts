import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { AppRegisterDto, AppUpdateDto } from './dto/app.dto';

/**
 * 应用信息接口
 */
export interface AppInfo {
  id: number;
  name: string;
  code: string;
  type: number;
  description?: string;
  logo?: string;
  domain?: string;
}

/**
 * 应用服务
 *
 * @description
 * 处理应用相关逻辑：
 * - 应用创建
 * - 应用查询
 * - 应用更新
 * - 应用删除
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建应用
   */
  async createApp(dto: AppRegisterDto): Promise<{ success: boolean; appId: number }> {
    // 检查应用编码是否已存在
    const existingApp = await this.prisma.app.findFirst({
      where: {
        code: dto.code,
        isDeleted: 0,
      },
    });

    if (existingApp) {
      throw new BadRequestException('应用编码已存在');
    }

    const app = await this.prisma.app.create({
      data: {
        uuid: crypto.randomUUID(),
        businessId: BigInt(dto.businessId),
        name: dto.name,
        code: dto.code,
        type: dto.type,
        description: dto.description,
        logo: dto.logo,
        domain: dto.domain,
        status: 1,
      },
    });

    this.logger.log(`应用创建成功: appId=${app.id}`);

    return {
      success: true,
      appId: Number(app.id),
    };
  }

  /**
   * 获取业务下的所有应用（启用状态）
   */
  async getBusinessApps(businessId: number): Promise<AppInfo[]> {
    const apps = await this.prisma.app.findMany({
      where: {
        businessId: BigInt(businessId),
        status: 1,
        isDeleted: 0,
      },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });

    return apps.map((a: any) => ({
      id: Number(a.id),
      name: a.name,
      code: a.code,
      type: a.type,
      description: a.description ?? undefined,
      logo: a.logo ?? undefined,
      domain: a.domain ?? undefined,
    }));
  }

  /**
   * 获取应用详情
   */
  async getAppById(appId: number): Promise<AppInfo | null> {
    const app = await this.prisma.app.findUnique({
      where: {
        id: BigInt(appId),
        status: 1,
        isDeleted: 0,
      },
    });

    if (!app) {
      return null;
    }

    return {
      id: Number(app.id),
      name: app.name,
      code: app.code,
      type: app.type,
      description: app.description ?? undefined,
      logo: app.logo ?? undefined,
      domain: app.domain ?? undefined,
    };
  }

  /**
   * 更新应用
   */
  async updateApp(appId: number, dto: AppUpdateDto): Promise<{ success: boolean }> {
    const app = await this.prisma.app.findUnique({
      where: { id: BigInt(appId) },
    });

    if (!app) {
      throw new BadRequestException('应用不存在');
    }

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.logo !== undefined) updateData.logo = dto.logo;
    if (dto.domain !== undefined) updateData.domain = dto.domain;

    await this.prisma.app.update({
      where: { id: BigInt(appId) },
      data: updateData,
    });

    return { success: true };
  }

  /**
   * 删除应用（软删除）
   */
  async deleteApp(appId: number): Promise<{ success: boolean }> {
    const app = await this.prisma.app.findUnique({
      where: { id: BigInt(appId) },
    });

    if (!app) {
      throw new BadRequestException('应用不存在');
    }

    await this.prisma.app.update({
      where: { id: BigInt(appId) },
      data: {
        isDeleted: 1,
      },
    });

    return { success: true };
  }
}
