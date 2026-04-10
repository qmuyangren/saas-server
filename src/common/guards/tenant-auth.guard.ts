import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { CacheService } from '@/infrastructure/cache/cache.service';
import { PrismaService } from '@/infrastructure/database/prisma.service';

/**
 * 租户校验守卫
 *
 * @description
 * 校验：
 * 1. X-Tenant-Id 必须存在且有效
 * 2. 用户有权访问该租户
 * 3. 租户处于启用状态
 *
 * 使用方式：
 * ```typescript
 * @UseGuards(TenantAuthGuard)
 * @Get('data')
 * getData(@CurrentTenant() tenantId: bigint) {
 *   return this.service.getData(tenantId);
 * }
 * ```
 */
@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as any;
    const tenantId = this.extractTenantIdFromHeader(request);

    // 如果没有 tenantId，抛出异常
    if (!tenantId) {
      throw new UnauthorizedException('缺少租户ID (X-Tenant-Id)');
    }

    // 验证租户ID格式
    const tenantIdNum = this.parseTenantId(tenantId);
    if (!tenantIdNum) {
      throw new UnauthorizedException('无效的租户ID');
    }

    // 从缓存检查租户访问权限
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('用户未认证');
    }

    // 缓存键：user:tenants:{userId}
    const tenants = await this.cache.get<string[]>(`user:tenants:${userId}`);

    // 如果缓存不存在，从数据库查询
    let tenantIds: string[] = [];
    if (tenants) {
      tenantIds = tenants;
    } else {
      const userTenants = await this.prisma.userTenant.findMany({
        where: {
          userId: BigInt(userId),
          isDeleted: 0,
          status: 1,
        },
        select: { tenantId: true },
      });
      tenantIds = userTenants.map(ut => ut.tenantId.toString());

      // 缓存租户列表（1小时）
      await this.cache.set(`user:tenants:${userId}`, tenantIds, 3600);
    }

    // 检查租户访问权限
    if (!tenantIds.includes(tenantId)) {
      throw new ForbiddenException('无权访问该租户');
    }

    // 验证租户状态
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
      select: { id: true, status: true, isDeleted: true },
    });

    if (!tenant) {
      throw new ForbiddenException('租户不存在');
    }

    if (tenant.status !== 1) {
      throw new ForbiddenException('租户已被禁用');
    }

    if (tenant.isDeleted !== 0) {
      throw new ForbiddenException('租户已被删除');
    }

    // 将租户信息挂载到 request 上
    request.tenantId = tenantIdNum;
    request.tenant = tenant;

    // 标记租户已验证
    request.tenantVerified = true;

    return true;
  }

  /**
   * 从请求头中提取 TenantId
   */
  private extractTenantIdFromHeader(request: Request): string | undefined {
    return request.headers['x-tenant-id'] as string;
  }

  /**
   * 解析租户ID
   */
  private parseTenantId(tenantId: string): number | bigint | null {
    const parsed = parseInt(tenantId, 10);
    if (isNaN(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  }
}

/**
 * 当前租户装饰器
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number | bigint | undefined => {
    const request = ctx.switchToHttp().getRequest() as any;
    return request.tenantId;
  },
);
