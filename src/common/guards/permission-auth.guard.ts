import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { CacheService } from '@/infrastructure/cache/cache.service';
import { PrismaService } from '@/infrastructure/database/prisma.service';

/**
 * 权限校验守卫
 *
 * @description
 * 校验用户是否有访问当前接口的权限
 *
 * 使用方式：
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionAuthGuard)
 * @Get('admin/data')
 * @RequirePermission('admin:data:view')
 * getData() {
 *   return this.service.getData();
 * }
 * ```
 */
@Injectable()
export class PermissionAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as any;
    const user = request.user;

    // 如果没有用户信息，拒绝访问
    if (!user || !user.userId) {
      throw new ForbiddenException('用户未认证');
    }

    // 获取用户权限列表
    const permissions = await this.getUserPermissions(
      user.userId,
      user.tenantId,
    );

    // 检查是否有对应的权限
    const requiredPermission = (request as any).requiredPermission;
    if (requiredPermission && !permissions.includes(requiredPermission)) {
      throw new ForbiddenException('没有访问权限');
    }

    // 将权限列表挂载到 request 上
    request.permissions = permissions;

    return true;
  }

  /**
   * 获取用户权限列表（带缓存）
   */
  private async getUserPermissions(
    userId: string | number,
    tenantId: string | number,
  ): Promise<string[]> {
    const cacheKey = `user:permission:${userId}:${tenantId}`;
    const cached = await this.cache.get<string[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // 从数据库查询用户权限
    const userRoles = await this.prisma.mapUserRole.findMany({
      where: { userId: BigInt(userId) },
      select: { roleId: true },
    });

    const roleIds = userRoles.map(ur => Number(ur.roleId));

    // 获取权限组ID
    const groupIds = await this.prisma.mapPermissionGroupTarget.findMany({
      where: {
        targetId: { in: roleIds },
        targetType: 'role',
      },
      select: { permissionGroupId: true },
    });

    const permissionGroupIds = groupIds.map(g => Number(g.permissionGroupId));

    // 获取权限码
    const permissions = await this.prisma.mapPermissionGroupPermission.findMany({
      where: {
        permissionGroupId: { in: permissionGroupIds },
      },
      include: {
        permission: {
          select: { code: true },
        },
      },
    });

    const permissionCodes: string[] = [];
    permissions.forEach(item => {
      if (item.permission.code && !permissionCodes.includes(item.permission.code)) {
        permissionCodes.push(item.permission.code);
      }
    });

    // 缓存权限列表（30分钟）
    await this.cache.set(cacheKey, permissionCodes, 1800);

    return permissionCodes;
  }
}

/**
 * 需要权限装饰器
 */
export const RequirePermission = (permissionCode: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 将权限码存储到方法上
    Reflect.defineProperty(descriptor.value, 'requiredPermission', {
      value: permissionCode,
      writable: false,
      configurable: false,
    });
  };
};
