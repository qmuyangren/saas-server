/**
 * 健康检查脚本 - 检查服务运行状态
 *
 * @description
 * 检查应用服务、数据库连接、Redis 连接等关键组件的健康状态。
 * 适用于部署后的服务验证和监控告警。
 *
 * 使用方式：
 * ```bash
 * npx ts-node scripts/health-check.ts
 * ```
 *
 * 环境变量：
 * - APP_URL: 应用地址，默认 http://localhost:8081
 * - DATABASE_URL: 数据库连接字符串
 * - REDIS_HOST: Redis 地址
 * - REDIS_PORT: Redis 端口
 */

import * as http from 'http';

interface CheckResult {
  name: string;
  status: 'ok' | 'error';
  message: string;
}

/**
 * 检查 HTTP 服务是否可用
 */
async function checkHttp(url: string): Promise<CheckResult> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({
        name: 'HTTP 服务',
        status: res.statusCode === 200 ? 'ok' : 'error',
        message: `状态码: ${res.statusCode}`,
      });
    });

    req.on('error', (error) => {
      resolve({
        name: 'HTTP 服务',
        status: 'error',
        message: `连接失败: ${error.message}`,
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        name: 'HTTP 服务',
        status: 'error',
        message: '连接超时',
      });
    });
  });
}

/**
 * 检查数据库连接
 */
async function checkDatabase(): Promise<CheckResult> {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    return { name: '数据库', status: 'ok', message: '连接正常' };
  } catch (error: any) {
    return {
      name: '数据库',
      status: 'error',
      message: `连接失败: ${error.message}`,
    };
  }
}

/**
 * 检查 Redis 连接
 */
async function checkRedis(): Promise<CheckResult> {
  try {
    const Redis = require('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
    await redis.ping();
    await redis.quit();
    return { name: 'Redis', status: 'ok', message: '连接正常' };
  } catch (error: any) {
    return {
      name: 'Redis',
      status: 'error',
      message: `连接失败: ${error.message}`,
    };
  }
}

async function main() {
  console.log('开始健康检查...\n');

  const appUrl = process.env.APP_URL || 'http://localhost:8081';

  const results = await Promise.all([
    checkHttp(`${appUrl}/api/v1`),
    checkDatabase(),
    checkRedis(),
  ]);

  let allOk = true;

  for (const result of results) {
    const icon = result.status === 'ok' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.status === 'error') {
      allOk = false;
    }
  }

  console.log('\n' + (allOk ? '✅ 所有检查通过！' : '❌ 存在异常，请检查！'));
  process.exit(allOk ? 0 : 1);
}

main();
