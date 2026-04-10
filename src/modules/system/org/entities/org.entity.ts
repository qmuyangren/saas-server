/**
 * 公司实体
 *
 * @description
 * 公司信息实体，对应 base_company 表
 */
export class CompanyInfo {
  /** 公司ID */
  id: number;

  /** 公司名称 */
  name: string;

  /** 公司编码 */
  code: string;

  /** 父公司ID */
  parentId: number;

  /** 层级 */
  level: number;

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

  /** 租户ID */
  tenantId?: number;
}

/**
 * 部门实体
 *
 * @description
 * 部门信息实体，对应 base_department 表
 */
export class DepartmentInfo {
  /** 部门ID */
  id: number;

  /** 公司ID */
  companyId: number;

  /** 部门名称 */
  name: string;

  /** 父部门ID */
  parentId: number;

  /** 部门领导ID */
  leaderId: number | null;

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

  /** 公司名称 */
  companyName?: string;

  /** 租户ID */
  tenantId?: number;
}

/**
 * 岗位实体
 *
 * @description
 * 岗位信息实体，对应 base_position 表
 */
export class PositionInfo {
  /** 岗位ID */
  id: number;

  /** 岗位名称 */
  name: string;

  /** 岗位编码 */
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

  /** 租户ID */
  tenantId?: number;
}

/**
 * 组织架构树节点
 *
 * @description
 * 用于组织架构树形结构展示
 */
export interface OrgTree {
  id: number;
  label: string;
  value: number;
  parentId?: number;
  children?: OrgTree[];
  type?: 'company' | 'department' | 'position';
  code?: string;
}
