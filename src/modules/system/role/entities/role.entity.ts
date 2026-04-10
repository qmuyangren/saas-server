/**
 * 角色实体
 *
 * @description
 * 角色信息实体，对应 base_role 表
 */
export class RoleInfo {
  /** 角色ID */
  id: number;

  /** 角色名称 */
  name: string;

  /** 角色编码 */
  code: string;

  /** 状态 */
  status: number;

  /** 排序 */
  sort: number;

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

  /** 用户数量 */
  userCount?: number;

  /** 租户ID */
  tenantId?: number;

  /** 父角色ID */
  parentId?: number;
}

/**
 * 角色树节点
 *
 * @description
 * 用于角色树形结构展示
 */
export interface RoleTree {
  /** 角色ID */
  id: number;
  /** 节点标签 */
  label: string;
  /** 节点值 */
  value: number;
  /** 父角色ID */
  parentId?: number;
  /** 子节点 */
  children?: RoleTree[];
  /** 角色名称 */
  name?: string;
  /** 角色编码 */
  code?: string;
  /** 状态 */
  status?: number;
  /** 排序 */
  sort?: number;
  /** 备注 */
  remark?: string;
}
