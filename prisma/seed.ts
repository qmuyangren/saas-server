import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed data...');

  // ==================== 1. 创建公司 ====================
  const company = await prisma.baseCompany.create({
    data: {
      id: 1n,
      name: '示例科技有限公司',
      code: 'DEMO',
      parentId: 0n,
      level: 1,
      status: 1,
      sort: 0,
      remark: '系统默认创建的公司',
    },
  });
  console.log('✅ Created company:', company.name);

  // ==================== 2. 创建部门 ====================
  const dept1 = await prisma.baseDepartment.create({
    data: {
      id: 1n,
      companyId: 1n,
      name: '技术部',
      parentId: 0n,
      status: 1,
      sort: 1,
    },
  });

  const dept2 = await prisma.baseDepartment.create({
    data: {
      id: 2n,
      companyId: 1n,
      name: '产品部',
      parentId: 0n,
      status: 1,
      sort: 2,
    },
  });

  const dept3 = await prisma.baseDepartment.create({
    data: {
      id: 3n,
      companyId: 1n,
      name: '运营部',
      parentId: 0n,
      status: 1,
      sort: 3,
    },
  });

  const dept4 = await prisma.baseDepartment.create({
    data: {
      id: 4n,
      companyId: 1n,
      name: '财务部',
      parentId: 0n,
      status: 1,
      sort: 4,
    },
  });

  const dept5 = await prisma.baseDepartment.create({
    data: {
      id: 5n,
      companyId: 1n,
      name: '人力资源部',
      parentId: 0n,
      status: 1,
      sort: 5,
    },
  });
  console.log('✅ Created 5 departments');

  // ==================== 3. 创建岗位 ====================
  const positions = await Promise.all([
    prisma.basePosition.create({
      data: { id: 1n, name: 'CEO', code: 'CEO', status: 1, sort: 1 },
    }),
    prisma.basePosition.create({
      data: { id: 2n, name: 'CTO', code: 'CTO', status: 1, sort: 2 },
    }),
    prisma.basePosition.create({
      data: { id: 3n, name: '技术总监', code: 'TECH_LEAD', status: 1, sort: 3 },
    }),
    prisma.basePosition.create({
      data: {
        id: 4n,
        name: '高级工程师',
        code: 'SENIOR_ENG',
        status: 1,
        sort: 4,
      },
    }),
    prisma.basePosition.create({
      data: { id: 5n, name: '工程师', code: 'ENG', status: 1, sort: 5 },
    }),
    prisma.basePosition.create({
      data: { id: 6n, name: '产品经理', code: 'PM', status: 1, sort: 6 },
    }),
    prisma.basePosition.create({
      data: { id: 7n, name: '运营专员', code: 'OPS', status: 1, sort: 7 },
    }),
  ]);
  console.log('✅ Created', positions.length, 'positions');

  // ==================== 4. 创建角色 ====================
  const adminRole = await prisma.baseRole.create({
    data: {
      id: 1n,
      name: '超级管理员',
      code: 'SUPER_ADMIN',
      status: 1,
      sort: 1,
      remark: '拥有系统所有权限',
    },
  });

  const userRole = await prisma.baseRole.create({
    data: {
      id: 2n,
      name: '普通用户',
      code: 'NORMAL_USER',
      status: 1,
      sort: 2,
      remark: '普通用户角色',
    },
  });

  const deptManagerRole = await prisma.baseRole.create({
    data: {
      id: 3n,
      name: '部门经理',
      code: 'DEPT_MANAGER',
      status: 1,
      sort: 3,
      remark: '部门管理角色',
    },
  });
  console.log('✅ Created roles: SUPER_ADMIN, NORMAL_USER, DEPT_MANAGER');

  // ==================== 5. 创建分组 ====================
  const groups = await Promise.all([
    prisma.baseGroup.create({
      data: {
        id: 1n,
        name: '核心开发组',
        type: 1,
        status: 1,
        remark: '核心功能开发团队',
      },
    }),
    prisma.baseGroup.create({
      data: {
        id: 2n,
        name: '前端开发组',
        type: 1,
        status: 1,
        remark: '前端开发团队',
      },
    }),
    prisma.baseGroup.create({
      data: {
        id: 3n,
        name: '后端开发组',
        type: 1,
        status: 1,
        remark: '后端开发团队',
      },
    }),
    prisma.baseGroup.create({
      data: { id: 4n, name: '测试组', type: 1, status: 1, remark: '测试团队' },
    }),
  ]);
  console.log('✅ Created', groups.length, 'groups');

  // ==================== 6. 创建用户标签 ====================
  const tags = await Promise.all([
    prisma.baseUserTag.create({
      data: { id: 1n, name: 'VIP', color: '#ff4d4f', status: 1 },
    }),
    prisma.baseUserTag.create({
      data: { id: 2n, name: '重要客户', color: '#faad14', status: 1 },
    }),
    prisma.baseUserTag.create({
      data: { id: 3n, name: '新用户', color: '#52c41a', status: 1 },
    }),
    prisma.baseUserTag.create({
      data: { id: 4n, name: '活跃用户', color: '#1890ff', status: 1 },
    }),
    prisma.baseUserTag.create({
      data: { id: 5n, name: '待跟进', color: '#722ed1', status: 1 },
    }),
  ]);
  console.log('✅ Created', tags.length, 'user tags');

  // ==================== 7. 创建权限 (权限层级: 应用/菜单/按钮) ====================
  // Level 1: 应用 (type=1)
  // Level 2: 菜单 (type=2)
  // Level 3: 按钮 (type=3)
  // Level 4: 列表 (type=4)
  // Level 5: 表单 (type=5)
  // Level 6: 数据 (type=6)

  // 仪表盘
  const permDashboard = await prisma.basePermission.create({
    data: {
      id: 1n,
      parentId: 0n,
      name: '仪表盘',
      code: 'dashboard',
      type: 1,
      path: '/dashboard',
      icon: 'DashboardOutlined',
      sort: 1,
      status: 1,
    },
  });

  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 1n,
        name: '工作台',
        code: 'dashboard:workbench',
        type: 2,
        path: '/dashboard/workbench',
        sort: 1,
        status: 1,
      },
      {
        parentId: 1n,
        name: '分析页',
        code: 'dashboard:analysis',
        type: 2,
        path: '/dashboard/analysis',
        sort: 2,
        status: 1,
      },
    ],
  });

  // 组织管理
  const permOrg = await prisma.basePermission.create({
    data: {
      id: 4n,
      parentId: 0n,
      name: '组织管理',
      code: 'org',
      type: 1,
      path: '/org',
      icon: 'TeamOutlined',
      sort: 2,
      status: 1,
    },
  });

  const orgPerms = await Promise.all([
    prisma.basePermission.create({
      data: {
        id: 5n,
        parentId: 4n,
        name: '公司管理',
        code: 'org:company',
        type: 2,
        path: '/org/company',
        sort: 1,
        status: 1,
      },
    }),
    prisma.basePermission.create({
      data: {
        id: 6n,
        parentId: 4n,
        name: '部门管理',
        code: 'org:department',
        type: 2,
        path: '/org/department',
        sort: 2,
        status: 1,
      },
    }),
    prisma.basePermission.create({
      data: {
        id: 7n,
        parentId: 4n,
        name: '岗位管理',
        code: 'org:position',
        type: 2,
        path: '/org/position',
        sort: 3,
        status: 1,
      },
    }),
    prisma.basePermission.create({
      data: {
        id: 8n,
        parentId: 4n,
        name: '用户管理',
        code: 'user',
        type: 2,
        path: '/user',
        sort: 4,
        status: 1,
      },
    }),
    prisma.basePermission.create({
      data: {
        id: 9n,
        parentId: 4n,
        name: '分组管理',
        code: 'group',
        type: 2,
        path: '/group',
        sort: 5,
        status: 1,
      },
    }),
    prisma.basePermission.create({
      data: {
        id: 10n,
        parentId: 4n,
        name: '用户标签',
        code: 'user-tag',
        type: 2,
        path: '/user-tag',
        sort: 6,
        status: 1,
      },
    }),
  ]);

  // 公司管理按钮权限
  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 5n,
        name: '公司列表',
        code: 'org:company:list',
        type: 4,
        sort: 1,
        status: 1,
      },
      {
        parentId: 5n,
        name: '新增公司',
        code: 'org:company:add',
        type: 3,
        sort: 2,
        status: 1,
      },
      {
        parentId: 5n,
        name: '编辑公司',
        code: 'org:company:edit',
        type: 3,
        sort: 3,
        status: 1,
      },
      {
        parentId: 5n,
        name: '删除公司',
        code: 'org:company:delete',
        type: 3,
        sort: 4,
        status: 1,
      },
    ],
  });

  // 部门管理按钮权限
  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 6n,
        name: '部门列表',
        code: 'org:department:list',
        type: 4,
        sort: 1,
        status: 1,
      },
      {
        parentId: 6n,
        name: '新增部门',
        code: 'org:department:add',
        type: 3,
        sort: 2,
        status: 1,
      },
      {
        parentId: 6n,
        name: '编辑部门',
        code: 'org:department:edit',
        type: 3,
        sort: 3,
        status: 1,
      },
      {
        parentId: 6n,
        name: '删除部门',
        code: 'org:department:delete',
        type: 3,
        sort: 4,
        status: 1,
      },
    ],
  });

  // 岗位管理按钮权限
  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 7n,
        name: '岗位列表',
        code: 'org:position:list',
        type: 4,
        sort: 1,
        status: 1,
      },
      {
        parentId: 7n,
        name: '新增岗位',
        code: 'org:position:add',
        type: 3,
        sort: 2,
        status: 1,
      },
      {
        parentId: 7n,
        name: '编辑岗位',
        code: 'org:position:edit',
        type: 3,
        sort: 3,
        status: 1,
      },
      {
        parentId: 7n,
        name: '删除岗位',
        code: 'org:position:delete',
        type: 3,
        sort: 4,
        status: 1,
      },
    ],
  });

  // 用户管理按钮权限
  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 8n,
        name: '用户列表',
        code: 'user:list',
        type: 4,
        sort: 1,
        status: 1,
      },
      {
        parentId: 8n,
        name: '新增用户',
        code: 'user:add',
        type: 3,
        sort: 2,
        status: 1,
      },
      {
        parentId: 8n,
        name: '编辑用户',
        code: 'user:edit',
        type: 3,
        sort: 3,
        status: 1,
      },
      {
        parentId: 8n,
        name: '删除用户',
        code: 'user:delete',
        type: 3,
        sort: 4,
        status: 1,
      },
      {
        parentId: 8n,
        name: '分配角色',
        code: 'user:assign-role',
        type: 3,
        sort: 5,
        status: 1,
      },
      {
        parentId: 8n,
        name: '重置密码',
        code: 'user:reset-password',
        type: 3,
        sort: 6,
        status: 1,
      },
    ],
  });

  // 权限管理
  const permSystem = await prisma.basePermission.create({
    data: {
      id: 30n,
      parentId: 0n,
      name: '权限管理',
      code: 'permission-mgmt',
      type: 1,
      path: '/permission-mgmt',
      icon: 'SafetyOutlined',
      sort: 3,
      status: 1,
    },
  });

  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 30n,
        name: '角色管理',
        code: 'role',
        type: 2,
        path: '/permission-mgmt/role',
        sort: 1,
        status: 1,
      },
      {
        parentId: 30n,
        name: '权限管理',
        code: 'permission',
        type: 2,
        path: '/permission-mgmt/permission',
        sort: 2,
        status: 1,
      },
      {
        parentId: 30n,
        name: '权限组管理',
        code: 'permission-group',
        type: 2,
        path: '/permission-mgmt/permission-group',
        sort: 3,
        status: 1,
      },
    ],
  });

  // 角色管理按钮权限
  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 31n,
        name: '角色列表',
        code: 'role:list',
        type: 4,
        sort: 1,
        status: 1,
      },
      {
        parentId: 31n,
        name: '新增角色',
        code: 'role:add',
        type: 3,
        sort: 2,
        status: 1,
      },
      {
        parentId: 31n,
        name: '编辑角色',
        code: 'role:edit',
        type: 3,
        sort: 3,
        status: 1,
      },
      {
        parentId: 31n,
        name: '删除角色',
        code: 'role:delete',
        type: 3,
        sort: 4,
        status: 1,
      },
      {
        parentId: 31n,
        name: '分配权限',
        code: 'role:permission',
        type: 3,
        sort: 5,
        status: 1,
      },
    ],
  });

  // 系统设置
  const permConfig = await prisma.basePermission.create({
    data: {
      id: 40n,
      parentId: 0n,
      name: '系统设置',
      code: 'system',
      type: 1,
      path: '/system',
      icon: 'SettingOutlined',
      sort: 4,
      status: 1,
    },
  });

  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 40n,
        name: '字典管理',
        code: 'dict',
        type: 2,
        path: '/system/dict',
        sort: 1,
        status: 1,
      },
      {
        parentId: 40n,
        name: '系统配置',
        code: 'config',
        type: 2,
        path: '/system/config',
        sort: 2,
        status: 1,
      },
    ],
  });

  // 字典管理按钮权限
  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 41n,
        name: '字典类型',
        code: 'dict:type',
        type: 2,
        path: '/system/dict/type',
        sort: 1,
        status: 1,
      },
      {
        parentId: 41n,
        name: '字典数据',
        code: 'dict:data',
        type: 2,
        path: '/system/dict/data',
        sort: 2,
        status: 1,
      },
    ],
  });

  // 日志审计
  const permLog = await prisma.basePermission.create({
    data: {
      id: 50n,
      parentId: 0n,
      name: '日志审计',
      code: 'log',
      type: 1,
      path: '/log',
      icon: 'FileTextOutlined',
      sort: 5,
      status: 1,
    },
  });

  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 50n,
        name: '操作日志',
        code: 'log:oper',
        type: 2,
        path: '/log/oper',
        sort: 1,
        status: 1,
      },
      {
        parentId: 50n,
        name: '登录日志',
        code: 'log:login',
        type: 2,
        path: '/log/login',
        sort: 2,
        status: 1,
      },
    ],
  });

  // 个人中心
  const permProfile = await prisma.basePermission.create({
    data: {
      id: 60n,
      parentId: 0n,
      name: '个人中心',
      code: 'profile',
      type: 1,
      path: '/profile',
      icon: 'UserOutlined',
      sort: 6,
      status: 1,
    },
  });

  await prisma.basePermission.createMany({
    data: [
      {
        parentId: 60n,
        name: '个人信息',
        code: 'profile:view',
        type: 2,
        path: '/profile/view',
        sort: 1,
        status: 1,
      },
      {
        parentId: 60n,
        name: '修改密码',
        code: 'profile:password',
        type: 2,
        path: '/profile/password',
        sort: 2,
        status: 1,
      },
    ],
  });

  console.log(
    '✅ Created permissions (dashboard, org, permission-mgmt, system, log, profile)',
  );

  // ==================== 8. 创建权限组 ====================
  const permGroups = await Promise.all([
    prisma.basePermissionGroup.create({
      data: {
        id: 1n,
        name: '系统管理员权限组',
        code: 'SYSTEM_ADMIN',
        type: 1,
        status: 1,
        remark: '系统内置超级管理员权限组',
      },
    }),
    prisma.basePermissionGroup.create({
      data: {
        id: 2n,
        name: '普通用户权限组',
        code: 'NORMAL_USER',
        type: 1,
        status: 1,
        remark: '普通用户权限组',
      },
    }),
    prisma.basePermissionGroup.create({
      data: {
        id: 3n,
        name: '部门经理权限组',
        code: 'DEPT_MANAGER',
        type: 2,
        status: 1,
        remark: '部门经理权限组',
      },
    }),
  ]);
  console.log('✅ Created permission groups');

  // ==================== 9. 创建管理员账号 ====================
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.baseUser.create({
    data: {
      id: 1n,
      uuid: 'admin-uuid-001',
      username: 'admin',
      password: hashedPassword,
      nickname: '系统管理员',
      avatar: null,
      phone: '13800138000',
      email: 'admin@example.com',
      status: 1,
      userType: 1,
      companyId: 1n,
      departmentId: 1n,
      positionId: 2n,
      loginCount: 0,
      registerTime: new Date(),
      tokenVersion: 1,
    },
  });
  console.log('✅ Created admin user (admin/admin123)');

  // 创建普通用户账号
  const userPassword = await bcrypt.hash('user123', 10);
  const normalUser = await prisma.baseUser.create({
    data: {
      id: 2n,
      uuid: 'user-uuid-001',
      username: 'user',
      password: userPassword,
      nickname: '普通用户',
      phone: '13900139000',
      email: 'user@example.com',
      status: 1,
      userType: 2,
      companyId: 1n,
      departmentId: 2n,
      positionId: 6n,
      loginCount: 0,
      registerTime: new Date(),
      tokenVersion: 1,
    },
  });
  console.log('✅ Created normal user (user/user123)');

  // ==================== 10. 关联用户角色 ====================
  await prisma.mapUserRole.createMany({
    data: [
      { userId: 1n, roleId: 1n }, // admin -> super_admin
      { userId: 2n, roleId: 2n }, // user -> normal_user
    ],
  });
  console.log('✅ Created user-role mappings');

  // ==================== 11. 关联用户分组 ====================
  await prisma.mapUserGroup.createMany({
    data: [
      { userId: 1n, groupId: 1n },
      { userId: 1n, groupId: 2n },
      { userId: 2n, groupId: 1n },
    ],
  });
  console.log('✅ Created user-group mappings');

  // ==================== 12. 关联用户标签 ====================
  await prisma.mapUserTag.createMany({
    data: [
      { userId: 1n, tagId: 1n }, // admin -> VIP
      { userId: 2n, tagId: 3n }, // user -> 新用户
      { userId: 2n, tagId: 4n }, // user -> 活跃用户
    ],
  });
  console.log('✅ Created user-tag mappings');

  // ==================== 13. 关联权限组权限 ====================
  // 获取所有权限ID
  const allPerms = await prisma.basePermission.findMany({
    select: { id: true },
  });
  const permIds = allPerms.map((p) => p.id);

  // 超级管理员权限组拥有所有权限
  const adminPermGroupPerms = permIds.map((permId) => ({
    permissionGroupId: 1n,
    permissionId: permId,
  }));
  await prisma.mapPermissionGroupPermission.createMany({
    data: adminPermGroupPerms,
  });

  // 普通用户权限组只拥有部分权限
  const normalUserPermCodes = [
    'dashboard:workbench',
    'user:list',
    'profile:view',
    'profile:password',
  ];
  const normalUserPerms = await prisma.basePermission.findMany({
    where: { code: { in: normalUserPermCodes } },
    select: { id: true },
  });
  await prisma.mapPermissionGroupPermission.createMany({
    data: normalUserPerms.map((p) => ({
      permissionGroupId: 2n,
      permissionId: p.id,
    })),
  });
  console.log('✅ Created permission-group-permission mappings');

  // ==================== 14. 关联权限组授权对象 ====================
  await prisma.mapPermissionGroupTarget.createMany({
    data: [
      { permissionGroupId: 1n, targetType: 'role', targetId: 1n }, // super_admin role
      { permissionGroupId: 2n, targetType: 'role', targetId: 2n }, // normal_user role
      { permissionGroupId: 3n, targetType: 'role', targetId: 3n }, // dept_manager role
    ],
  });
  console.log('✅ Created permission-group-target mappings');

  // ==================== 15. 创建字典类型 ====================
  const dictTypes = await Promise.all([
    prisma.cfgDictType.create({
      data: {
        id: 1n,
        code: 'user_status',
        name: '用户状态',
        status: 1,
        remark: '用户状态字典',
      },
    }),
    prisma.cfgDictType.create({
      data: {
        id: 2n,
        code: 'user_type',
        name: '用户类型',
        status: 1,
        remark: '用户类型字典',
      },
    }),
    prisma.cfgDictType.create({
      data: {
        id: 3n,
        code: 'gender',
        name: '性别',
        status: 1,
        remark: '性别字典',
      },
    }),
    prisma.cfgDictType.create({
      data: {
        id: 4n,
        code: 'yes_no',
        name: '是否',
        status: 1,
        remark: '是否字典',
      },
    }),
    prisma.cfgDictType.create({
      data: {
        id: 5n,
        code: 'status',
        name: '通用状态',
        status: 1,
        remark: '通用状态字典',
      },
    }),
    prisma.cfgDictType.create({
      data: {
        id: 6n,
        code: 'group_type',
        name: '分组类型',
        status: 1,
        remark: '分组类型字典',
      },
    }),
    prisma.cfgDictType.create({
      data: {
        id: 7n,
        code: 'perm_type',
        name: '权限类型',
        status: 1,
        remark: '权限类型字典',
      },
    }),
  ]);
  console.log('✅ Created dict types');

  // ==================== 16. 创建字典数据 ====================
  await prisma.cfgDictData.createMany({
    data: [
      // 用户状态
      {
        dictType: 'user_status',
        label: '禁用',
        value: '0',
        sort: 1,
        status: 1,
        cssClass: 'ant-tag-red',
      },
      {
        dictType: 'user_status',
        label: '启用',
        value: '1',
        sort: 2,
        status: 1,
        cssClass: 'ant-tag-green',
        isDefault: 1,
      },
      {
        dictType: 'user_status',
        label: '锁定',
        value: '2',
        sort: 3,
        status: 1,
        cssClass: 'ant-tag-orange',
      },

      // 用户类型
      {
        dictType: 'user_type',
        label: '管理员',
        value: '1',
        sort: 1,
        status: 1,
      },
      {
        dictType: 'user_type',
        label: '普通用户',
        value: '2',
        sort: 2,
        status: 1,
        isDefault: 1,
      },
      { dictType: 'user_type', label: '两者', value: '3', sort: 3, status: 1 },

      // 性别
      {
        dictType: 'gender',
        label: '未知',
        value: '0',
        sort: 1,
        status: 1,
        isDefault: 1,
      },
      { dictType: 'gender', label: '男', value: '1', sort: 2, status: 1 },
      { dictType: 'gender', label: '女', value: '2', sort: 3, status: 1 },

      // 是否
      {
        dictType: 'yes_no',
        label: '否',
        value: '0',
        sort: 1,
        status: 1,
        isDefault: 1,
      },
      { dictType: 'yes_no', label: '是', value: '1', sort: 2, status: 1 },

      // 通用状态
      { dictType: 'status', label: '禁用', value: '0', sort: 1, status: 1 },
      {
        dictType: 'status',
        label: '启用',
        value: '1',
        sort: 2,
        status: 1,
        isDefault: 1,
      },

      // 分组类型
      {
        dictType: 'group_type',
        label: '项目组',
        value: '1',
        sort: 1,
        status: 1,
        isDefault: 1,
      },
      {
        dictType: 'group_type',
        label: '兴趣组',
        value: '2',
        sort: 2,
        status: 1,
      },
      {
        dictType: 'group_type',
        label: '临时组',
        value: '3',
        sort: 3,
        status: 1,
      },

      // 权限类型
      { dictType: 'perm_type', label: '应用', value: '1', sort: 1, status: 1 },
      { dictType: 'perm_type', label: '菜单', value: '2', sort: 2, status: 1 },
      { dictType: 'perm_type', label: '按钮', value: '3', sort: 3, status: 1 },
      { dictType: 'perm_type', label: '列表', value: '4', sort: 4, status: 1 },
      { dictType: 'perm_type', label: '表单', value: '5', sort: 5, status: 1 },
      { dictType: 'perm_type', label: '数据', value: '6', sort: 6, status: 1 },
    ],
  });
  console.log('✅ Created dict data');

  // ==================== 17. 创建系统配置 ====================
  await prisma.cfgSystemConfig.createMany({
    data: [
      {
        configKey: 'system.name',
        configValue: '企业管理系统',
        configType: 'text',
        configGroup: 'basic',
        name: '系统名称',
        isPublic: 1,
        status: 1,
      },
      {
        configKey: 'system.logo',
        configValue: '/logo.png',
        configType: 'text',
        configGroup: 'basic',
        name: '系统Logo',
        isPublic: 1,
        status: 1,
      },
      {
        configKey: 'system.copyright',
        configValue: '© 2026 Enterprise Management System',
        configType: 'text',
        configGroup: 'basic',
        name: '版权信息',
        isPublic: 1,
        status: 1,
      },
      {
        configKey: 'password.minLength',
        configValue: '6',
        configType: 'number',
        configGroup: 'security',
        name: '密码最小长度',
        isPublic: 0,
        status: 1,
      },
      {
        configKey: 'password.maxLength',
        configValue: '20',
        configType: 'number',
        configGroup: 'security',
        name: '密码最大长度',
        isPublic: 0,
        status: 1,
      },
      {
        configKey: 'password.requireUppercase',
        configValue: 'false',
        configType: 'boolean',
        configGroup: 'security',
        name: '密码需要大写字母',
        isPublic: 0,
        status: 1,
      },
      {
        configKey: 'password.requireNumber',
        configValue: 'false',
        configType: 'boolean',
        configGroup: 'security',
        name: '密码需要数字',
        isPublic: 0,
        status: 1,
      },
      {
        configKey: 'password.requireSpecial',
        configValue: 'false',
        configType: 'boolean',
        configGroup: 'security',
        name: '密码需要特殊字符',
        isPublic: 0,
        status: 1,
      },
      {
        configKey: 'login.maxAttempts',
        configValue: '5',
        configType: 'number',
        configGroup: 'login',
        name: '登录最大尝试次数',
        isPublic: 0,
        status: 1,
      },
      {
        configKey: 'login.lockoutDuration',
        configValue: '300',
        configType: 'number',
        configGroup: 'login',
        name: '锁定时长(秒)',
        isPublic: 0,
        status: 1,
      },
      {
        configKey: 'login.sessionTimeout',
        configValue: '7200',
        configType: 'number',
        configGroup: 'login',
        name: '会话超时(秒)',
        isPublic: 0,
        status: 1,
      },
      {
        configKey: 'login.captchaEnabled',
        configValue: 'true',
        configType: 'boolean',
        configGroup: 'login',
        name: '启用验证码',
        isPublic: 1,
        status: 1,
      },
      {
        configKey: 'email.enabled',
        configValue: 'false',
        configType: 'boolean',
        configGroup: 'email',
        name: '启用邮件',
        isPublic: 0,
        status: 1,
      },
      {
        configKey: 'sms.enabled',
        configValue: 'false',
        configType: 'boolean',
        configGroup: 'sms',
        name: '启用短信',
        isPublic: 0,
        status: 1,
      },
    ],
  });
  console.log('✅ Created system configs');

  // ==================== 18. 创建操作日志示例 ====================
  await prisma.logOper.createMany({
    data: [
      {
        userId: 1n,
        username: 'admin',
        module: '用户管理',
        operation: '新增用户',
        method: 'POST',
        url: '/api/v1/user',
        params: '{"username":"test","email":"test@example.com"}',
        result: '{"id":3,"username":"test"}',
        status: 1,
        ip: '127.0.0.1',
        duration: 150,
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: 1n,
        username: 'admin',
        module: '角色管理',
        operation: '分配权限',
        method: 'PUT',
        url: '/api/v1/role/1/permissions',
        params: '{"permissionIds":[1,2,3]}',
        result: '{"success":true}',
        status: 1,
        ip: '127.0.0.1',
        duration: 80,
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: 2n,
        username: 'user',
        module: '个人中心',
        operation: '修改密码',
        method: 'PUT',
        url: '/api/v1/user/password',
        params: '{}',
        result: '{"success":true}',
        status: 1,
        ip: '127.0.0.1',
        duration: 200,
        userAgent: 'Mozilla/5.0',
      },
    ],
  });
  console.log('✅ Created operation logs');

  console.log('\n🎉 Seed data completed successfully!');
  console.log('\n📋 登录信息:');
  console.log('   - 管理员: admin / admin123');
  console.log('   - 普通用户: user / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
