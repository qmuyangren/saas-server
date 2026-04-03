import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ErrorCode } from '../constants';

/**
 * 权限装饰器 - 用于接口权限校验
 *
 * @description
 * 标记需要特定权限才能访问的接口，配合 `PermissionGuard` 使用。
 * 验证用户是否具有指定的权限编码，支持多个权限（满足任一即可）。
 * 权限编码通常与按钮、菜单、API 接口对应。
 *
 * @param permissions - 权限编码列表，如 ['user:list', 'user:edit']
 *
 * @example
 * ```typescript
 * // 单个权限
 * @Permissions('user:delete')
 * @Delete(':id')
 * async remove(@Param('id') id: number) {
 *   return this.userService.remove(id);
 * }
 *
 * // 多个权限（满足任一即可）
 * @Permissions('user:create', 'user:import')
 * @Post('batch')
 * async batchCreate(@Body() dtos: CreateUserDto[]) {
 *   return this.userService.batchCreate(dtos);
 * }
 *
 * // 控制器级别
 * @Permissions('system:config')
 * @Controller('system/config')
 * export class SystemConfigController {}
 * ```
 *
 * @see {@link PermissionGuard} 配合使用的权限守卫
 */
export const Permissions = (...permissions: string[]) =>
  Reflect.metadata('permissions', permissions);

/**
 * 权限守卫 - 验证用户是否具有访问接口所需的权限
 *
 * @description
 * 基于 RBAC（基于角色的访问控制）模型的权限验证。
 * 从用户 token 中提取用户 ID，查询该用户拥有的所有权限编码，
 * 与 `@Permissions()` 装饰器配置的权限进行匹配。
 *
 * 工作流程：
 * 1. 检查接口是否配置了 `@Permissions()` 装饰器，未配置则放行
 * 2. 从请求中提取用户信息（由 AuthGuard 注入）
 * 3. 查询用户拥有的所有权限编码
 * 4. 检查用户权限是否包含所需权限（满足任一即可）
 * 5. 权限不足则抛出 403 异常
 *
 * @example
 * ```typescript
 * // main.ts 全局注册
 * app.useGlobalGuards(new PermissionGuard());
 *
 * // 控制器中使用
 * @Permissions('dict:type:create')
 * @Post()
 * async create(@Body() dto: CreateDictTypeDto) {
 *   return this.dictTypeService.create(dto);
 * }
 * ```
 *
 * @see {@link Permissions} 权限配置装饰器
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: ErrorCode.UNAUTHORIZED,
        message: '未登录',
      });
    }

    const userPermissions = await this.getUserPermissions(user.sub || user.id);

    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      this.logger.warn(
        `Permission denied: user ${user.email} lacks [${requiredPermissions.join(', ')}]`,
      );
      throw new ForbiddenException({
        code: ErrorCode.FORBIDDEN,
        message: '权限不足',
      });
    }

    return true;
  }

  private async getUserPermissions(userId: number): Promise<string[]> {
    const result = await this.prisma.$queryRaw<
      Array<{ code: string }>
    >`SELECT DISTINCT p.code FROM base_permission p
      INNER JOIN map_permission_group_permission pgp ON p.id = pgp.permission_id
      INNER JOIN map_permission_group_target pgt ON pgp.permission_group_id = pgt.permission_group_id
      INNER JOIN map_user_role ur ON pgt.target_id = ur.role_id
      WHERE ur.user_id = ${userId} AND p.status = 1 AND pgt.target_type = 'role'`;

    return result.map((item) => item.code);
  }
}
