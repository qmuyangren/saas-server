/**
 * 数据填充脚本 - 初始化数据库种子数据
 *
 * @description
 * 向数据库中插入初始数据，包括管理员账号、字典数据等。
 * 适用于新环境部署后的数据初始化。
 *
 * 使用方式：
 * ```bash
 * npx ts-node scripts/seed.ts
 * ```
 *
 * 环境变量：
 * - DATABASE_URL: 数据库连接字符串
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充数据...');

  // 创建管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.baseUser.create({
    data: {
      uuid: 'admin-001',
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      nickname: '系统管理员',
      status: 1,
      registerTime: new Date(),
    },
  });
  console.log(`管理员账号已创建: ${admin.email}`);

  // 创建字典类型
  const dictTypes = [
    { code: 'gender', name: '性别', status: 1, isDeleted: 0 },
    { code: 'status', name: '状态', status: 1, isDeleted: 0 },
    { code: 'yes_no', name: '是否', status: 1, isDeleted: 0 },
  ];

  for (const dictType of dictTypes) {
    await prisma.cfgDictType.create({ data: dictType }).catch(() => {});
  }
  console.log(`字典类型已创建: ${dictTypes.length} 条`);

  // 创建字典数据
  const dictData = [
    { dictType: 'gender', label: '男', value: '1', sort: 1, status: 1 },
    { dictType: 'gender', label: '女', value: '2', sort: 2, status: 1 },
    { dictType: 'status', label: '启用', value: '1', sort: 1, status: 1 },
    { dictType: 'status', label: '禁用', value: '0', sort: 2, status: 1 },
    { dictType: 'yes_no', label: '是', value: '1', sort: 1, status: 1 },
    { dictType: 'yes_no', label: '否', value: '0', sort: 2, status: 1 },
  ];

  for (const data of dictData) {
    await prisma.cfgDictData.create({ data }).catch(() => {});
  }
  console.log(`字典数据已创建: ${dictData.length} 条`);

  console.log('数据填充完成！');
}

main()
  .catch((e) => {
    console.error('数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
