/**
 * 用户实体
 *
 * @description
 * 用户信息实体，对应 base_user 表
 */
export class UserInfo {
  /** 用户ID */
  id: number;

  /** 用户UUID */
  uuid: string;

  /** 用户名 */
  username: string;

  /** 昵称 */
  nickname: string | null;

  /** 头像 */
  avatar: string | null;

  /** 手机号 */
  phone: string | null;

  /** 邮箱 */
  email: string | null;

  /** 状态 */
  status: number;

  /** 用户类型 */
  userType: number;

  /** 公司ID */
  companyId: number | null;

  /** 部门ID */
  departmentId: number | null;

  /** 岗位ID */
  positionId: number | null;

  /** 租户ID */
  tenantId?: number;

  /** 微信OpenID */
  wechatOpenid: string | null;

  /** 钉钉UserID */
  dingtalkUserid: string | null;

  /** 企业微信UserID */
  weworkUserid: string | null;

  /** Github ID */
  githubId: string | null;

  /** 最后登录IP */
  lastLoginIp: string | null;

  /** 最后登录时间 */
  lastLoginTime: Date | null;

  /** 登录次数 */
  loginCount: number;

  /** 注册时间 */
  registerTime: Date | null;

  /** 注册IP */
  registerIp: string | null;

  /** token版本 */
  tokenVersion: number;

  /** 密码过期时间 */
  passwordExpireTime: Date | null;

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

  /** 版本号 */
  version: number;
}
