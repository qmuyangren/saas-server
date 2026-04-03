/**
 * 第三方服务配置初始数据
 *
 * @description
 * 向数据库中插入第三方服务的初始配置数据。
 * 包括短信、云存储、邮件、第三方登录等服务商的默认配置。
 * 所有配置的密钥字段使用占位符，部署后需替换为真实值。
 *
 * 使用方式：
 * ```bash
 * npx ts-node scripts/init-third-party-configs.ts
 * ```
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 第三方服务初始配置数据
 */
const thirdPartyConfigs = [
  // === 短信服务 ===
  {
    code: 'aliyun_sms',
    name: '阿里云短信',
    type: 'sms',
    provider: 'aliyun',
    config: JSON.stringify({
      accessKeyId: 'YOUR_ACCESS_KEY_ID',
      accessKeySecret: 'YOUR_ACCESS_KEY_SECRET',
      signName: '您的短信签名',
      region: 'cn-hangzhou',
      endpoint: 'dysmsapi.aliyuncs.com',
    }),
    status: 1,
    isDefault: 1,
    remark: '阿里云短信服务，用于发送验证码和通知短信',
  },
  {
    code: 'tencent_sms',
    name: '腾讯云短信',
    type: 'sms',
    provider: 'tencent',
    config: JSON.stringify({
      secretId: 'YOUR_SECRET_ID',
      secretKey: 'YOUR_SECRET_KEY',
      signName: '您的短信签名',
      sdkAppId: '1400XXXXXX',
      region: 'ap-guangzhou',
    }),
    status: 0,
    isDefault: 0,
    remark: '腾讯云短信服务，备用短信通道',
  },

  // === 云存储服务 ===
  {
    code: 'aliyun_oss',
    name: '阿里云 OSS',
    type: 'storage',
    provider: 'oss',
    config: JSON.stringify({
      accessKeyId: 'YOUR_ACCESS_KEY_ID',
      accessKeySecret: 'YOUR_ACCESS_KEY_SECRET',
      bucket: 'your-bucket-name',
      region: 'oss-cn-hangzhou',
      endpoint: 'oss-cn-hangzhou.aliyuncs.com',
      cdnDomain: 'https://cdn.example.com',
    }),
    status: 1,
    isDefault: 1,
    remark: '阿里云对象存储，用于文件上传和存储',
  },
  {
    code: 'huawei_obs',
    name: '华为云 OBS',
    type: 'storage',
    provider: 'obs',
    config: JSON.stringify({
      accessKeyId: 'YOUR_ACCESS_KEY_ID',
      secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
      bucket: 'your-bucket-name',
      region: 'cn-east-3',
      endpoint: 'obs.cn-east-3.myhuaweicloud.com',
      cdnDomain: 'https://cdn.example.com',
    }),
    status: 0,
    isDefault: 0,
    remark: '华为云对象存储，备用存储通道',
  },
  {
    code: 'qiniu_kodo',
    name: '七牛云 Kodo',
    type: 'storage',
    provider: 'qiniu',
    config: JSON.stringify({
      accessKey: 'YOUR_ACCESS_KEY',
      secretKey: 'YOUR_SECRET_KEY',
      bucket: 'your-bucket-name',
      domain: 'https://cdn.example.com',
      zone: 'z0',
    }),
    status: 0,
    isDefault: 0,
    remark: '七牛云对象存储，备用存储通道',
  },

  // === 邮件服务 ===
  {
    code: 'smtp_mail',
    name: 'SMTP 邮件服务',
    type: 'mail',
    provider: 'smtp',
    config: JSON.stringify({
      host: 'smtp.example.com',
      port: 465,
      username: 'noreply@example.com',
      password: 'YOUR_SMTP_PASSWORD',
      secure: true,
      fromEmail: 'noreply@example.com',
      fromName: '系统通知',
    }),
    status: 1,
    isDefault: 1,
    remark: 'SMTP 邮件服务，用于发送通知邮件',
  },

  // === 第三方登录 ===
  {
    code: 'wechat_oauth',
    name: '微信登录',
    type: 'oauth',
    provider: 'wechat',
    config: JSON.stringify({
      appId: 'YOUR_WECHAT_APP_ID',
      appSecret: 'YOUR_WECHAT_APP_SECRET',
      redirectUri: 'https://your-domain.com/api/v1/auth/callback/wechat',
      scope: 'snsapi_login',
    }),
    status: 0,
    isDefault: 0,
    remark: '微信开放平台登录，需先在开放平台创建网站应用',
  },
  {
    code: 'dingtalk_oauth',
    name: '钉钉登录',
    type: 'oauth',
    provider: 'dingtalk',
    config: JSON.stringify({
      appId: 'YOUR_DINGTALK_APP_ID',
      appSecret: 'YOUR_DINGTALK_APP_SECRET',
      redirectUri: 'https://your-domain.com/api/v1/auth/callback/dingtalk',
    }),
    status: 0,
    isDefault: 0,
    remark: '钉钉扫码登录，需在钉钉开放平台创建应用',
  },
  {
    code: 'wework_oauth',
    name: '企业微信登录',
    type: 'oauth',
    provider: 'wework',
    config: JSON.stringify({
      corpId: 'YOUR_WECOM_CORP_ID',
      agentId: 'YOUR_WECOM_AGENT_ID',
      redirectUri: 'https://your-domain.com/api/v1/auth/callback/wework',
    }),
    status: 0,
    isDefault: 0,
    remark: '企业微信扫码登录，需在管理后台创建应用',
  },
];

/**
 * 系统配置中的默认服务商和开关
 */
const systemConfigs = [
  // 默认服务商
  {
    configKey: 'default_sms_provider',
    configValue: 'aliyun_sms',
    configType: 'text',
    configGroup: 'third_party',
    name: '默认短信服务',
    remark: '默认使用的短信服务商编码',
    isPublic: 0,
    status: 1,
  },
  {
    configKey: 'default_storage_provider',
    configValue: 'aliyun_oss',
    configType: 'text',
    configGroup: 'third_party',
    name: '默认存储服务',
    remark: '默认使用的云存储服务商编码',
    isPublic: 0,
    status: 1,
  },
  {
    configKey: 'default_mail_provider',
    configValue: 'smtp_mail',
    configType: 'text',
    configGroup: 'third_party',
    name: '默认邮件服务',
    remark: '默认使用的邮件服务商编码',
    isPublic: 0,
    status: 1,
  },

  // 功能开关
  {
    configKey: 'sms_enabled',
    configValue: '1',
    configType: 'number',
    configGroup: 'third_party',
    name: '短信功能开关',
    remark: '1=启用，0=禁用',
    isPublic: 0,
    status: 1,
  },
  {
    configKey: 'storage_enabled',
    configValue: '1',
    configType: 'number',
    configGroup: 'third_party',
    name: '存储功能开关',
    remark: '1=启用，0=禁用',
    isPublic: 0,
    status: 1,
  },
  {
    configKey: 'mail_enabled',
    configValue: '1',
    configType: 'number',
    configGroup: 'third_party',
    name: '邮件功能开关',
    remark: '1=启用，0=禁用',
    isPublic: 0,
    status: 1,
  },
  {
    configKey: 'oauth_wechat_enabled',
    configValue: '0',
    configType: 'number',
    configGroup: 'third_party',
    name: '微信登录开关',
    remark: '1=启用，0=禁用',
    isPublic: 0,
    status: 1,
  },
  {
    configKey: 'oauth_dingtalk_enabled',
    configValue: '0',
    configType: 'number',
    configGroup: 'third_party',
    name: '钉钉登录开关',
    remark: '1=启用，0=禁用',
    isPublic: 0,
    status: 1,
  },
  {
    configKey: 'oauth_wework_enabled',
    configValue: '0',
    configType: 'number',
    configGroup: 'third_party',
    name: '企业微信登录开关',
    remark: '1=启用，0=禁用',
    isPublic: 0,
    status: 1,
  },
];

async function main() {
  console.log('开始初始化第三方服务配置...\n');

  // 插入第三方服务配置
  let successCount = 0;
  let skipCount = 0;

  for (const config of thirdPartyConfigs) {
    try {
      await prisma.cfgThirdParty.upsert({
        where: { code: config.code },
        update: {},
        create: config,
      });
      console.log(`✅ ${config.name} (${config.type}/${config.provider})`);
      successCount++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏭️  ${config.name} 已存在，跳过`);
        skipCount++;
      } else {
        console.error(`❌ ${config.name} 插入失败:`, error.message);
      }
    }
  }

  console.log(
    `\n第三方服务配置: 成功 ${successCount} 条，跳过 ${skipCount} 条`,
  );

  // 插入系统配置
  let sysSuccessCount = 0;
  let sysSkipCount = 0;

  for (const config of systemConfigs) {
    try {
      await prisma.cfgSystemConfig.upsert({
        where: { configKey: config.configKey },
        update: {},
        create: config,
      });
      console.log(`✅ ${config.name}: ${config.configValue}`);
      sysSuccessCount++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏭️  ${config.name} 已存在，跳过`);
        sysSkipCount++;
      } else {
        console.error(`❌ ${config.name} 插入失败:`, error.message);
      }
    }
  }

  console.log(
    `\n系统配置: 成功 ${sysSuccessCount} 条，跳过 ${sysSkipCount} 条`,
  );
  console.log('\n✅ 第三方服务配置初始化完成！');
  console.log('\n⚠️  请注意：所有密钥字段为占位符，部署后需替换为真实值。');
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
