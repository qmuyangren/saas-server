import { SetMetadata } from '@nestjs/common';

/**
 * 角色装饰器 - 用于接口权限控制
 *
 * @description
 * 该装饰器用于标记需要特定角色才能访问的接口或控制器。
 * 配合 `RolesGuard` 使用，在请求处理前验证用户是否具有所需角色。
 * 可以设置多个角色，用户只需满足其中一个即可访问。
 *
 * @param roles - 允许访问的角色列表，如 ['admin', 'manager']
 * @returns Metadata 装饰器
 *
 * @example
 * ```typescript
 * // 单个角色
 * @Roles('admin')
 * @Delete(':id')
 * async remove(@Param('id') id: number) {
 *   return this.userService.remove(id);
 * }
 *
 * // 多个角色（满足任一即可）
 * @Roles('admin', 'manager')
 * @Put(':id')
 * async update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
 *   return this.userService.update(id, dto);
 * }
 *
 * // 控制器级别（该控制器下所有接口都需要 admin 角色）
 * @Roles('admin')
 * @Controller('admin/users')
 * export class AdminUserController {}
 * ```
 *
 * @see {@link RolesGuard} 配合使用的守卫
 * @see {@link Public} 公开接口装饰器（跳过角色验证）
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
