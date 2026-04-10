/**
 * 权限实体
 *
 * @description
 * 权限信息实体，对应 base_permission 表
 */
export class PermissionInfo {
  /** 权限ID */
  id: number;

  /** 父权限ID */
  parentId: number;

  /** 权限名称 */
  name: string;

  /** 权限编码 */
  code: string;

  /** 权限类型 (1-目录 2-菜单 3-按钮 4-接口) */
  type: number;

  /** 路由路径 */
  path: string | null;

  /** 组件路径 */
  component: string | null;

  /** 图标 */
  icon: string | null;

  /** 排序 */
  sort: number;

  /** 状态 */
  status: number;

  /** 备注 */
  remark: string | null;

  /** 创建人ID */
  createdBy: number | null;

  /** 创建时间 */
  createdAt: Date;

  /** 更新人ID */
  updatedBy: number | null;

  /** 更新时间 */
  updatedAt: Date;

  /** 删除标记 */
  isDeleted: number;

  /** 删除人ID */
  deletedBy: number | null;

  /** 删除时间 */
  deletedAt: Date | null;

  /** 子权限 */
  children?: PermissionInfo[];

  /** 父权限名称 */
  parentName?: string;

  /** 租户ID */
  tenantId?: number;
}

/**
 * 权限树节点
 *
 * @description
 * 用于权限树形结构展示
 */
export interface PermissionTree {
  id: number;
  label: string;
  value: number;
  parentId?: number;
  children?: PermissionTree[];
  type?: number;
  code?: string;
  path?: string | null;
  component?: string | null;
  icon?: string | null;
  sort?: number;
  status?: number;
}

/**
 * 目标类型常量
 *
 * @description
 * 用于权限组目标类型的枚举
 */
export const TargetType = {
  ROLE: 'role',
  USER: 'user',
  TENANT: 'tenant',
} as const;

export type TargetType = typeof TargetType[keyof typeof TargetType];
