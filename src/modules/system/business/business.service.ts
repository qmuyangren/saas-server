import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { BusinessRegisterDto, BusinessUpdateDto } from './dto/business.dto';

/**
 * 业务信息接口
 */
export interface BusinessInfo {
  id: number;
  name: string;
  code: string;
  icon?: string;
  description?: string;
}

/**
 * 业务服务
 *
 * @description
 * 处理业务线相关逻辑：
 * - 业务线创建
 * - 业务线查询
 * - 业务线更新
 * - 业务线删除
 */
@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建业务线
   */
  async createBusiness(dto: BusinessRegisterDto): Promise<{ success: boolean; businessId: number }> {
    // 检查业务编码是否已存在
    const existingBusiness = await this.prisma.business.findFirst({
      where: {
        code: dto.code,
        isDeleted: 0,
      },
    });

    if (existingBusiness) {
      throw new BadRequestException('业务编码已存在');
    }

    const business = await this.prisma.business.create({
      data: {
        uuid: crypto.randomUUID(),
        name: dto.name,
        code: dto.code,
        icon: dto.icon,
        description: dto.description,
        status: 1,
      },
    });

    this.logger.log(`业务线创建成功: businessId=${business.id}`);

    return {
      success: true,
      businessId: Number(business.id),
    };
  }

  /**
   * 获取所有业务线（启用状态）
   */
  async getAllBusinesses(): Promise<BusinessInfo[]> {
    const businesses = await this.prisma.business.findMany({
      where: {
        status: 1,
        isDeleted: 0,
      },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });

    return businesses.map((b: any) => ({
      id: Number(b.id),
      name: b.name,
      code: b.code,
      icon: b.icon ?? undefined,
      description: b.description ?? undefined,
    }));
  }

  /**
   * 获取业务线详情
   */
  async getBusinessById(businessId: number): Promise<BusinessInfo | null> {
    const business = await this.prisma.business.findUnique({
      where: {
        id: BigInt(businessId),
        status: 1,
        isDeleted: 0,
      },
    });

    if (!business) {
      return null;
    }

    return {
      id: Number(business.id),
      name: business.name,
      code: business.code,
      icon: business.icon ?? undefined,
      description: business.description ?? undefined,
    };
  }

  /**
   * 更新业务线
   */
  async updateBusiness(
    businessId: number,
    dto: BusinessUpdateDto,
  ): Promise<{ success: boolean }> {
    const business = await this.prisma.business.findUnique({
      where: { id: BigInt(businessId) },
    });

    if (!business) {
      throw new BadRequestException('业务线不存在');
    }

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.description !== undefined) updateData.description = dto.description;

    await this.prisma.business.update({
      where: { id: BigInt(businessId) },
      data: updateData,
    });

    return { success: true };
  }

  /**
   * 删除业务线（软删除）
   */
  async deleteBusiness(businessId: number): Promise<{ success: boolean }> {
    const business = await this.prisma.business.findUnique({
      where: { id: BigInt(businessId) },
    });

    if (!business) {
      throw new BadRequestException('业务线不存在');
    }

    await this.prisma.business.update({
      where: { id: BigInt(businessId) },
      data: {
        isDeleted: 1,
      },
    });

    return { success: true };
  }
}
