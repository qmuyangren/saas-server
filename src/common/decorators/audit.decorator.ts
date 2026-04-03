import { SetMetadata } from '@nestjs/common';

/**
 * 审计日志装饰器 - 用于记录用户操作日志
 *
 * @description
 * 标记需要记录审计日志的接口，配合审计拦截器使用。
 * 自动记录操作人、操作类型、请求参数、响应结果等信息到审计日志表。
 * 适用于需要追踪用户操作行为的场景（如数据修改、权限变更等）。
 *
 * @param options - 审计日志配置选项
 * @param options.module - 模块名称，如 '用户管理'
 * @param options.operation - 操作描述，如 '新增用户'
 * @param options.logParams - 是否记录请求参数，默认 true
 * @param options.logResult - 是否记录响应结果，默认 true
 *
 * @example
 * ```typescript
 * // 基础用法
 * @Audit({ module: '用户管理', operation: '新增用户' })
 * @Post()
 * async create(@Body() dto: CreateUserDto) {
 *   return this.userService.create(dto);
 * }
 *
 * // 不记录请求参数（敏感数据）
 * @Audit({ module: '认证', operation: '用户登录', logParams: false })
 * @Post('login')
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 *
 * // 不记录响应结果（数据量大）
 * @Audit({ module: '字典管理', operation: '导出字典', logResult: false })
 * @Post('export')
 * async exportDict() {
 *   return this.dictService.export();
 * }
 *
 * // 完整配置
 * @Audit({
 *   module: '角色管理',
 *   operation: '分配权限',
 *   logParams: true,
 *   logResult: true,
 * })
 * @Post(':id/permissions')
 * async assignPermissions(@Param('id') id: number, @Body() dto: AssignPermissionDto) {
 *   return this.roleService.assignPermissions(id, dto);
 * }
 * ```
 *
 * @see {@link AuditInterceptor} 配合使用的审计拦截器
 */
export const Audit = (options: {
  module: string;
  operation: string;
  logParams?: boolean;
  logResult?: boolean;
}) => SetMetadata('audit', options);
