/**
 * 系统配置实体
 *
 * @description
 * 系统配置信息实体，对应 cfg_system_config 表
 */
export class ConfigInfo {
  /** 配置ID */
  id: number;

  /** 配置键 */
  configKey: string;

  /** 配置值 */
  configValue: string | null;

  /** 配置类型 */
  configType: string | null;

  /** 配置分组 */
  configGroup: string | null;

  /** 配置名称 */
  name: string;

  /** 备注 */
  remark: string | null;

  /** 是否公开 */
  isPublic: number;

  /** 状态 */
  status: number;

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
}
