import {
  applyDecorators,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * 管理员保护装饰器
 *
 * @description
 * 组合使用认证守卫和角色守卫，标记需要管理员权限的接口
 *
 * @example
 * ```ts
 * @AdminProtected()
 * @Post()
 * create(@Body() dto: CreateUserDto) {
 *   return this.userService.create(dto);
 * }
 * ```
 */
export const AdminProtected = () => {
  return applyDecorators(
    UseGuards(AuthGuard, RolesGuard),
    Roles('admin'),
  );
};

/**
 * 用户保护装饰器
 *
 * @description
 * 组合使用认证守卫，标记需要用户登录的接口（非管理员）
 *
 * @example
 * ```ts
 * @UserProtected()
 * @Get('me')
 * getProfile(@CurrentUser() user: any) {
 *   return this.userService.findOne(user.id);
 * }
 * ```
 */
export const UserProtected = () => {
  return applyDecorators(
    UseGuards(AuthGuard),
  );
};

/**
 * 租户保护装饰器
 *
 * @description
 * 组合使用认证守卫和租户守卫，标记需要租户上下文的接口
 *
 * @example
 * ```ts
 * @TenantProtected()
 * @Get('tenants/:id')
 * getTenant(@CurrentTenant() tenantId: bigint) {
 *   return this.tenantService.findOne(tenantId);
 * }
 * ```
 */
export const TenantProtected = () => {
  return applyDecorators(
    UseGuards(AuthGuard),
  );
};
