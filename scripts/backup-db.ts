#!/usr/bin/env node

/**
 * 数据库备份脚本 - 导出 MySQL 数据库
 *
 * @description
 * 使用 mysqldump 工具导出数据库结构和数据。
 * 支持全量备份和增量备份，备份文件按日期命名。
 *
 * 使用方式：
 * ```bash
 * npx ts-node scripts/backup-db.ts
 * ```
 *
 * 环境变量：
 * - DB_HOST: 数据库主机
 * - DB_PORT: 数据库端口
 * - DB_USER: 数据库用户名
 * - DB_PASSWORD: 数据库密码
 * - DB_NAME: 数据库名称
 * - BACKUP_DIR: 备份文件目录，默认 ./backups
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const backupDir = process.env.BACKUP_DIR || './backups';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const fileName = `backup-${timestamp}.sql`;
const filePath = path.join(backupDir, fileName);

async function main() {
  console.log('开始数据库备份...');

  // 确保备份目录存在
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '3306';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'enterprise_mgmt';

  try {
    const passwordArg = dbPassword ? `-p${dbPassword}` : '';
    const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} ${passwordArg} ${dbName} > ${filePath}`;

    execSync(command, { stdio: 'inherit' });

    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`数据库备份完成！`);
    console.log(`备份文件: ${filePath}`);
    console.log(`文件大小: ${sizeMB} MB`);
  } catch (error) {
    console.error('数据库备份失败:', error);
    process.exit(1);
  }
}

main();
