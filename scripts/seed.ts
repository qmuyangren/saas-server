/**
 * 数据填充脚本 - 初始化数据库种子数据
 *
 * @description
 * 向数据库中插入初始数据，包括管理员账号、字典数据、系统配置等。
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

  // 创建管理员账号（使用 upsert 避免重复创建）
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.baseUser.upsert({
    where: { uuid: 'admin-001' },
    update: {
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      nickname: '系统管理员',
      status: 1,
    },
    create: {
      uuid: 'admin-001',
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      nickname: '系统管理员',
      status: 1,
      registerTime: new Date(),
    },
  });
  console.log(`管理员账号已存在: ${admin.email}`);

  // 创建系统配置 - 参考 JNPF base_sys_config 和项目实际需求
  const systemConfigs = [
    // 基础配置
    {
      configKey: 'site_name',
      configValue: '企业级管理系统',
      configType: 'text',
      configGroup: 'basic',
      name: '站点名称',
      remark: '系统站点名称',
      isPublic: 1,
      status: 1,
    },
    {
      configKey: 'site_url',
      configValue: 'http://localhost:3000',
      configType: 'text',
      configGroup: 'basic',
      name: '站点URL',
      remark: '系统访问地址',
      isPublic: 1,
      status: 1,
    },
    {
      configKey: 'site_icp',
      configValue: '',
      configType: 'text',
      configGroup: 'basic',
      name: '备案号',
      remark: 'ICP备案号',
      isPublic: 1,
      status: 1,
    },
    {
      configKey: 'default_avatar',
      configValue: '/assets/images/default-avatar.png',
      configType: 'text',
      configGroup: 'user',
      name: '默认头像',
      remark: '用户默认头像地址',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'default_password',
      configValue: '123456',
      configType: 'password',
      configGroup: 'user',
      name: '初始密码',
      remark: '新用户默认密码',
      isPublic: 0,
      status: 1,
    },
    // 文件存储配置
    {
      configKey: 'file_upload_size_limit',
      configValue: '104857600',
      configType: 'text',
      configGroup: 'storage',
      name: '文件上传大小限制',
      remark: '单位：字节，默认100MB',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_upload_type_limit',
      configValue: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,7z',
      configType: 'textarea',
      configGroup: 'storage',
      name: '文件上传类型限制',
      remark: '允许上传的文件类型，逗号分隔',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_storage_type',
      configValue: '1',
      configType: 'select',
      configGroup: 'storage',
      name: '文件存储类型',
      remark: '1-本地存储，2-OSS云存储，3-七牛云存储',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_oss_endpoint',
      configValue: '',
      configType: 'text',
      configGroup: 'storage',
      name: 'OSS端点',
      remark: 'OSS存储端点URL',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_oss_bucket',
      configValue: '',
      configType: 'text',
      configGroup: 'storage',
      name: 'OSSBucket名称',
      remark: 'OSS存储桶名称',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_oss_access_key',
      configValue: '',
      configType: 'password',
      configGroup: 'storage',
      name: 'OSS访问Key',
      remark: 'OSS访问密钥',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_oss_secret_key',
      configValue: '',
      configType: 'password',
      configGroup: 'storage',
      name: 'OSS密钥',
      remark: 'OSS密钥',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_qiniu_access_key',
      configValue: '',
      configType: 'password',
      configGroup: 'storage',
      name: '七牛AccessKey',
      remark: '七牛云AccessKey',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_qiniu_secret_key',
      configValue: '',
      configType: 'password',
      configGroup: 'storage',
      name: '七牛密钥',
      remark: '七牛云SecretKey',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_qiniu_bucket',
      configValue: '',
      configType: 'text',
      configGroup: 'storage',
      name: '七牛Bucket',
      remark: '七牛云存储空间名称',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'file_qiniu_domain',
      configValue: '',
      configType: 'text',
      configGroup: 'storage',
      name: '七牛域名',
      remark: '七牛云CDN域名',
      isPublic: 0,
      status: 1,
    },
    // 安全配置
    {
      configKey: 'session_timeout',
      configValue: '7200',
      configType: 'text',
      configGroup: 'security',
      name: '会话超时时间',
      remark: '单位：秒，默认2小时',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'login_fail_lock',
      configValue: '300',
      configType: 'text',
      configGroup: 'security',
      name: '登录失败锁定时间',
      remark: '单位：秒，默认5分钟',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'login_fail_max_try',
      configValue: '5',
      configType: 'text',
      configGroup: 'security',
      name: '登录失败最大尝试次数',
      remark: '超过次数锁定账户',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'password_expire_days',
      configValue: '90',
      configType: 'text',
      configGroup: 'security',
      name: '密码过期天数',
      remark: '单位：天，默认90天',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'password_min_length',
      configValue: '8',
      configType: 'text',
      configGroup: 'security',
      name: '密码最小长度',
      remark: '密码最小长度要求',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'captcha_enabled',
      configValue: '1',
      configType: 'radio',
      configGroup: 'security',
      name: '验证码启用',
      remark: '0-禁用，1-启用',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'captcha_type',
      configValue: 'slider',
      configType: 'select',
      configGroup: 'security',
      name: '验证码类型',
      remark: 'slider-拖拽验证码，image-图形验证码',
      isPublic: 0,
      status: 1,
    },
    // 邮件配置
    {
      configKey: 'email_host',
      configValue: '',
      configType: 'text',
      configGroup: 'email',
      name: 'SMTP服务器',
      remark: 'SMTP服务器地址',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'email_port',
      configValue: '465',
      configType: 'text',
      configGroup: 'email',
      name: 'SMTP端口',
      remark: 'SMTP端口，默认465或587',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'email_username',
      configValue: '',
      configType: 'text',
      configGroup: 'email',
      name: '邮箱账号',
      remark: '发件人邮箱账号',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'email_password',
      configValue: '',
      configType: 'password',
      configGroup: 'email',
      name: '邮箱密码',
      remark: '邮箱密码或授权码',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'email_from_name',
      configValue: '系统通知',
      configType: 'text',
      configGroup: 'email',
      name: '发件人名称',
      remark: '显示的发件人名称',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'email_ssl_enabled',
      configValue: '1',
      configType: 'radio',
      configGroup: 'email',
      name: 'SSL启用',
      remark: '0-禁用，1-启用',
      isPublic: 0,
      status: 1,
    },
    // 短信配置
    {
      configKey: 'sms_channel',
      configValue: '',
      configType: 'select',
      configGroup: 'sms',
      name: '短信渠道',
      remark: '短信服务商：aliyun-阿里云，tencent-腾讯云',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'sms_access_key_id',
      configValue: '',
      configType: 'text',
      configGroup: 'sms',
      name: 'AccessKeyId',
      remark: '短信服务AccessKeyId',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'sms_access_key_secret',
      configValue: '',
      configType: 'password',
      configGroup: 'sms',
      name: 'AccessKeySecret',
      remark: '短信服务AccessKeySecret',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'sms_sign_name',
      configValue: '',
      configType: 'text',
      configGroup: 'sms',
      name: '短信签名',
      remark: '短信签名名称',
      isPublic: 0,
      status: 1,
    },
    // OAuth 配置
    // 微信登录配置
    {
      configKey: 'oauth_wechat_enabled',
      configValue: '0',
      configType: 'radio',
      configGroup: 'oauth',
      name: '微信登录开关',
      remark: '0-禁用，1-启用',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_wechat_appId',
      configValue: '',
      configType: 'text',
      configGroup: 'oauth',
      name: '微信AppId',
      remark: '微信登录AppId',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_wechat_appSecret',
      configValue: '',
      configType: 'password',
      configGroup: 'oauth',
      name: '微信AppSecret',
      remark: '微信登录AppSecret',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_wechat_redirectUri',
      configValue: '',
      configType: 'text',
      configGroup: 'oauth',
      name: '微信回调地址',
      remark: '微信登录回调地址',
      isPublic: 0,
      status: 1,
    },
    // 钉钉登录配置
    {
      configKey: 'oauth_dingtalk_enabled',
      configValue: '0',
      configType: 'radio',
      configGroup: 'oauth',
      name: '钉钉登录开关',
      remark: '0-禁用，1-启用',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_dingtalk_appKey',
      configValue: '',
      configType: 'text',
      configGroup: 'oauth',
      name: '钉钉AppKey',
      remark: '钉钉登录AppKey',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_dingtalk_appSecret',
      configValue: '',
      configType: 'password',
      configGroup: 'oauth',
      name: '钉钉AppSecret',
      remark: '钉钉登录AppSecret',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_dingtalk_redirectUri',
      configValue: '',
      configType: 'text',
      configGroup: 'oauth',
      name: '钉钉回调地址',
      remark: '钉钉登录回调地址',
      isPublic: 0,
      status: 1,
    },
    // 企业微信登录配置
    {
      configKey: 'oauth_wework_enabled',
      configValue: '0',
      configType: 'radio',
      configGroup: 'oauth',
      name: '企业微信登录开关',
      remark: '0-禁用，1-启用',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_wework_corpId',
      configValue: '',
      configType: 'text',
      configGroup: 'oauth',
      name: '企业微信CorpId',
      remark: '企业微信CorpId',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_wework_agentId',
      configValue: '',
      configType: 'text',
      configGroup: 'oauth',
      name: '企业微信AgentId',
      remark: '企业微信AgentId',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_wework_appSecret',
      configValue: '',
      configType: 'password',
      configGroup: 'oauth',
      name: '企业微信AppSecret',
      remark: '企业微信AppSecret',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_wework_redirectUri',
      configValue: '',
      configType: 'text',
      configGroup: 'oauth',
      name: '企业微信回调地址',
      remark: '企业微信登录回调地址',
      isPublic: 0,
      status: 1,
    },
    // GitHub 登录配置
    {
      configKey: 'oauth_github_enabled',
      configValue: '0',
      configType: 'radio',
      configGroup: 'oauth',
      name: 'GitHub登录开关',
      remark: '0-禁用，1-启用',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_github_clientId',
      configValue: '',
      configType: 'text',
      configGroup: 'oauth',
      name: 'GitHubClientId',
      remark: 'GitHub登录ClientId',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_github_clientSecret',
      configValue: '',
      configType: 'password',
      configGroup: 'oauth',
      name: 'GitHubClientSecret',
      remark: 'GitHub登录ClientSecret',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'oauth_github_redirectUri',
      configValue: '',
      configType: 'text',
      configGroup: 'oauth',
      name: 'GitHub回调地址',
      remark: 'GitHub登录回调地址',
      isPublic: 0,
      status: 1,
    },
    // Redis 配置
    {
      configKey: 'redis_host',
      configValue: 'localhost',
      configType: 'text',
      configGroup: 'redis',
      name: 'Redis主机',
      remark: 'Redis服务器地址',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'redis_port',
      configValue: '6379',
      configType: 'text',
      configGroup: 'redis',
      name: 'Redis端口',
      remark: 'Redis服务器端口',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'redis_password',
      configValue: '',
      configType: 'password',
      configGroup: 'redis',
      name: 'Redis密码',
      remark: 'Redis认证密码',
      isPublic: 0,
      status: 1,
    },
    {
      configKey: 'redis_database',
      configValue: '0',
      configType: 'text',
      configGroup: 'redis',
      name: 'Redis数据库',
      remark: 'Redis数据库编号',
      isPublic: 0,
      status: 1,
    },
  ];

  // 插入系统配置
  for (const config of systemConfigs) {
    await prisma.cfgSystemConfig.upsert({
      where: { configKey: config.configKey },
      update: config,
      create: config,
    });
  }
  console.log(`系统配置已创建/更新: ${systemConfigs.length} 条`);

  // 创建字典类型
  const dictTypes = [
    { code: 'user_type', name: '用户类型', isTree: 0, type: 1, sort: 0, status: 1, remark: '用户类型字典' },
    { code: 'yes_no', name: '是否', isTree: 0, type: 1, sort: 1, status: 1, remark: '是/否选择' },
    { code: 'sys_type', name: '系统类型', isTree: 0, type: 1, sort: 2, status: 1, remark: '系统分类' },
    { code: 'data_scope', name: '数据范围', isTree: 0, type: 1, sort: 3, status: 1, remark: '数据权限范围' },
    { code: 'log_type', name: '日志类型', isTree: 0, type: 1, sort: 4, status: 1, remark: '操作日志类型' },
    { code: 'notice_type', name: '通知类型', isTree: 0, type: 1, sort: 5, status: 1, remark: '系统通知类型' },
    { code: 'sms_status', name: '短信状态', isTree: 0, type: 1, sort: 6, status: 1, remark: '短信发送状态' },
    { code: 'email_status', name: '邮件状态', isTree: 0, type: 1, sort: 7, status: 1, remark: '邮件发送状态' },
    { code: 'file_storage_type', name: '文件存储类型', isTree: 0, type: 1, sort: 8, status: 1, remark: '文件存储方式' },
    { code: 'oauth_provider', name: '第三方登录', isTree: 0, type: 1, sort: 9, status: 1, remark: 'OAuth.provider' },
    { code: 'app_type', name: '应用类型', isTree: 0, type: 1, sort: 10, status: 1, remark: '应用端类型' },
    { code: 'business_status', name: '业务状态', isTree: 0, type: 1, sort: 11, status: 1, remark: '业务线状态' },
    { code: 'tenant_status', name: '租户状态', isTree: 0, type: 1, sort: 12, status: 1, remark: '租户状态' },
    { code: 'permission_type', name: '权限类型', isTree: 0, type: 1, sort: 13, status: 1, remark: '菜单/按钮权限' },
    { code: 'oui_status', name: '状态', isTree: 0, type: 1, sort: 14, status: 1, remark: '启用/禁用状态' },
  ];

  for (const dictType of dictTypes) {
    await prisma.cfgDictType.upsert({
      where: { code: dictType.code },
      update: dictType,
      create: dictType,
    });
  }
  console.log(`字典类型已创建/更新: ${dictTypes.length} 条`);

  // 创建字典数据
  const dictDataList = [
    // user_type
    { dictType: 'user_type', label: '普通用户', value: '2', sort: 1, status: 1, isDefault: 1, description: '普通用户' },
    { dictType: 'user_type', label: '管理员', value: '1', sort: 2, status: 1, isDefault: 0, description: '系统管理员' },
    // oui_status (是/否)
    { dictType: 'oui_status', label: '启用', value: '1', sort: 1, status: 1, isDefault: 1, description: '启用状态' },
    { dictType: 'oui_status', label: '禁用', value: '0', sort: 2, status: 1, isDefault: 0, description: '禁用状态' },
    // yes_no
    { dictType: 'yes_no', label: '是', value: '1', sort: 1, status: 1, isDefault: 1, description: '确认是' },
    { dictType: 'yes_no', label: '否', value: '0', sort: 2, status: 1, isDefault: 0, description: '确认否' },
    // sys_type
    { dictType: 'sys_type', label: '系统管理', value: '1', sort: 1, status: 1, isDefault: 1, description: '系统管理模块' },
    { dictType: 'sys_type', label: '业务管理', value: '2', sort: 2, status: 1, isDefault: 0, description: '业务管理模块' },
    { dictType: 'sys_type', label: '数据分析', value: '3', sort: 3, status: 1, isDefault: 0, description: '数据分析模块' },
    // data_scope
    { dictType: 'data_scope', label: '全部数据', value: '1', sort: 1, status: 1, isDefault: 1, description: '可见全部数据' },
    { dictType: 'data_scope', label: '部门数据', value: '2', sort: 2, status: 1, isDefault: 0, description: '仅可见本部门数据' },
    { dictType: 'data_scope', label: '本人数据', value: '3', sort: 3, status: 1, isDefault: 0, description: '仅可见本人数据' },
    // log_type
    { dictType: 'log_type', label: '操作日志', value: '1', sort: 1, status: 1, isDefault: 1, description: '常规操作日志' },
    { dictType: 'log_type', label: '登录日志', value: '2', sort: 2, status: 1, isDefault: 0, description: '用户登录日志' },
    { dictType: 'log_type', label: '异常日志', value: '3', sort: 3, status: 1, isDefault: 0, description: '系统异常日志' },
    // notice_type
    { dictType: 'notice_type', label: '公告', value: '1', sort: 1, status: 1, isDefault: 1, description: '系统公告' },
    { dictType: 'notice_type', label: '通知', value: '2', sort: 2, status: 1, isDefault: 0, description: '系统通知' },
    // sms_status
    { dictType: 'sms_status', label: '发送成功', value: '1', sort: 1, status: 1, isDefault: 1, description: '短信发送成功' },
    { dictType: 'sms_status', label: '发送失败', value: '0', sort: 2, status: 1, isDefault: 0, description: '短信发送失败' },
    // email_status
    { dictType: 'email_status', label: '发送成功', value: '1', sort: 1, status: 1, isDefault: 1, description: '邮件发送成功' },
    { dictType: 'email_status', label: '发送失败', value: '0', sort: 2, status: 1, isDefault: 0, description: '邮件发送失败' },
    // file_storage_type
    { dictType: 'file_storage_type', label: '本地存储', value: '1', sort: 1, status: 1, isDefault: 1, description: '本地文件存储' },
    { dictType: 'file_storage_type', label: 'OSS云存储', value: '2', sort: 2, status: 1, isDefault: 0, description: '阿里云OSS存储' },
    { dictType: 'file_storage_type', label: '七牛云存储', value: '3', sort: 3, status: 1, isDefault: 0, description: '七牛云存储' },
    // oauth_provider
    { dictType: 'oauth_provider', label: '微信', value: 'wechat', sort: 1, status: 1, isDefault: 0, description: '微信登录' },
    { dictType: 'oauth_provider', label: '钉钉', value: 'dingtalk', sort: 2, status: 1, isDefault: 0, description: '钉钉登录' },
    { dictType: 'oauth_provider', label: '企业微信', value: 'wework', sort: 3, status: 1, isDefault: 0, description: '企业微信登录' },
    { dictType: 'oauth_provider', label: 'GitHub', value: 'github', sort: 4, status: 1, isDefault: 0, description: 'GitHub登录' },
    // app_type
    { dictType: 'app_type', label: 'PC端', value: '1', sort: 1, status: 1, isDefault: 1, description: 'PC端应用' },
    { dictType: 'app_type', label: 'Mobile端', value: '2', sort: 2, status: 1, isDefault: 0, description: '移动端应用' },
    { dictType: 'app_type', label: '小程序', value: '3', sort: 3, status: 1, isDefault: 0, description: '微信小程序' },
    // business_status
    { dictType: 'business_status', label: '启用', value: '1', sort: 1, status: 1, isDefault: 1, description: '业务线启用' },
    { dictType: 'business_status', label: '禁用', value: '0', sort: 2, status: 1, isDefault: 0, description: '业务线禁用' },
    // tenant_status
    { dictType: 'tenant_status', label: '启用', value: '1', sort: 1, status: 1, isDefault: 1, description: '租户启用' },
    { dictType: 'tenant_status', label: '禁用', value: '0', sort: 2, status: 1, isDefault: 0, description: '租户禁用' },
    // permission_type
    { dictType: 'permission_type', label: '菜单', value: '1', sort: 1, status: 1, isDefault: 1, description: '菜单权限' },
    { dictType: 'permission_type', label: '按钮', value: '2', sort: 2, status: 1, isDefault: 0, description: '按钮权限' },
    { dictType: 'permission_type', label: 'API', value: '3', sort: 3, status: 1, isDefault: 0, description: 'API接口权限' },
  ];

  // 创建字典数据 - 使用 dictType + value 作为唯一键
  for (const data of dictDataList) {
    await prisma.cfgDictData.upsert({
      where: { dictType_value: { dictType: data.dictType, value: data.value } },
      update: data,
      create: data,
    });
  }
  console.log(`字典数据已创建/更新: ${dictDataList.length} 条`);

  // 创建行政区划数据 - 中国省级、市级、区县级
  const areas = [
    // 省级（type=1）
    { code: '110000', fullName: '北京市', quickQuery: 'Beijing', type: 1, sort: 1, status: 1, remark: '北京市' },
    { code: '120000', fullName: '天津市', quickQuery: 'Tianjin', type: 1, sort: 2, status: 1, remark: '天津市' },
    { code: '130000', fullName: '河北省', quickQuery: 'Hebei', type: 1, sort: 3, status: 1, remark: '河北省' },
    { code: '140000', fullName: '山西省', quickQuery: 'Shanxi', type: 1, sort: 4, status: 1, remark: '山西省' },
    { code: '150000', fullName: '内蒙古自治区', quickQuery: 'Neimenggu', type: 1, sort: 5, status: 1, remark: '内蒙古自治区' },
    { code: '210000', fullName: '辽宁省', quickQuery: 'Liaoning', type: 1, sort: 6, status: 1, remark: '辽宁省' },
    { code: '220000', fullName: '吉林省', quickQuery: 'Jilin', type: 1, sort: 7, status: 1, remark: '吉林省' },
    { code: '230000', fullName: '黑龙江省', quickQuery: 'Heilongjiang', type: 1, sort: 8, status: 1, remark: '黑龙江省' },
    { code: '310000', fullName: '上海市', quickQuery: 'Shanghai', type: 1, sort: 9, status: 1, remark: '上海市' },
    { code: '320000', fullName: '江苏省', quickQuery: 'Jiangsu', type: 1, sort: 10, status: 1, remark: '江苏省' },
    { code: '330000', fullName: '浙江省', quickQuery: 'Zhejiang', type: 1, sort: 11, status: 1, remark: '浙江省' },
    { code: '340000', fullName: '安徽省', quickQuery: 'Anhui', type: 1, sort: 12, status: 1, remark: '安徽省' },
    { code: '350000', fullName: '福建省', quickQuery: 'Fujian', type: 1, sort: 13, status: 1, remark: '福建省' },
    { code: '360000', fullName: '江西省', quickQuery: 'Jiangxi', type: 1, sort: 14, status: 1, remark: '江西省' },
    { code: '370000', fullName: '山东省', quickQuery: 'Shandong', type: 1, sort: 15, status: 1, remark: '山东省' },
    { code: '410000', fullName: '河南省', quickQuery: 'Henan', type: 1, sort: 16, status: 1, remark: '河南省' },
    { code: '420000', fullName: '湖北省', quickQuery: 'Hubei', type: 1, sort: 17, status: 1, remark: '湖北省' },
    { code: '430000', fullName: '湖南省', quickQuery: 'Hunan', type: 1, sort: 18, status: 1, remark: '湖南省' },
    { code: '440000', fullName: '广东省', quickQuery: 'Guangdong', type: 1, sort: 19, status: 1, remark: '广东省' },
    { code: '450000', fullName: '广西壮族自治区', quickQuery: 'Guangxi', type: 1, sort: 20, status: 1, remark: '广西壮族自治区' },
    { code: '460000', fullName: '海南省', quickQuery: 'Hainan', type: 1, sort: 21, status: 1, remark: '海南省' },
    { code: '500000', fullName: '重庆市', quickQuery: 'Chongqing', type: 1, sort: 22, status: 1, remark: '重庆市' },
    { code: '510000', fullName: '四川省', quickQuery: 'Sichuan', type: 1, sort: 23, status: 1, remark: '四川省' },
    { code: '520000', fullName: '贵州省', quickQuery: 'Guizhou', type: 1, sort: 24, status: 1, remark: '贵州省' },
    { code: '530000', fullName: '云南省', quickQuery: 'Yunnan', type: 1, sort: 25, status: 1, remark: '云南省' },
    { code: '540000', fullName: '西藏自治区', quickQuery: 'Xizang', type: 1, sort: 26, status: 1, remark: '西藏自治区' },
    { code: '610000', fullName: '陕西省', quickQuery: 'Shaanxi', type: 1, sort: 27, status: 1, remark: '陕西省' },
    { code: '620000', fullName: '甘肃省', quickQuery: 'Gansu', type: 1, sort: 28, status: 1, remark: '甘肃省' },
    { code: '630000', fullName: '青海省', quickQuery: 'Qinghai', type: 1, sort: 29, status: 1, remark: '青海省' },
    { code: '640000', fullName: '宁夏回族自治区', quickQuery: 'Ningxia', type: 1, sort: 30, status: 1, remark: '宁夏回族自治区' },
    { code: '650000', fullName: '新疆维吾尔自治区', quickQuery: 'Xinjiang', type: 1, sort: 31, status: 1, remark: '新疆维吾尔自治区' },
    { code: '710000', fullName: '台湾省', quickQuery: 'Taiwan', type: 1, sort: 32, status: 1, remark: '台湾省' },
    { code: '810000', fullName: '香港特别行政区', quickQuery: 'Hong Kong', type: 1, sort: 33, status: 1, remark: '香港特别行政区' },
    { code: '820000', fullName: '澳门特别行政区', quickQuery: 'Macao', type: 1, sort: 34, status: 1, remark: '澳门特别行政区' },
    // 市级（type=2）- 选取部分地级市
    { code: '110100', fullName: '北京市', quickQuery: 'Beijing', type: 2, sort: 1, status: 1, remark: '北京市', parentId: 110000 },
    { code: '120100', fullName: '天津市', quickQuery: 'Tianjin', type: 2, sort: 1, status: 1, remark: '天津市', parentId: 120000 },
    { code: '130100', fullName: '石家庄市', quickQuery: 'Shijiazhuang', type: 2, sort: 1, status: 1, remark: '石家庄市', parentId: 130000 },
    { code: '130200', fullName: '唐山市', quickQuery: 'Tangshan', type: 2, sort: 2, status: 1, remark: '唐山市', parentId: 130000 },
    { code: '130300', fullName: '秦皇岛市', quickQuery: 'Qinhuangdao', type: 2, sort: 3, status: 1, remark: '秦皇岛市', parentId: 130000 },
    { code: '310100', fullName: '上海市', quickQuery: 'Shanghai', type: 2, sort: 1, status: 1, remark: '上海市', parentId: 310000 },
    { code: '320100', fullName: '南京市', quickQuery: 'Nanjing', type: 2, sort: 1, status: 1, remark: '南京市', parentId: 320000 },
    { code: '320200', fullName: '无锡市', quickQuery: 'Wuxi', type: 2, sort: 2, status: 1, remark: '无锡市', parentId: 320000 },
    { code: '330100', fullName: '杭州市', quickQuery: 'Hangzhou', type: 2, sort: 1, status: 1, remark: '杭州市', parentId: 330000 },
    { code: '330200', fullName: '宁波市', quickQuery: 'Ningbo', type: 2, sort: 2, status: 1, remark: '宁波市', parentId: 330000 },
    { code: '340100', fullName: '合肥市', quickQuery: 'Hefei', type: 2, sort: 1, status: 1, remark: '合肥市', parentId: 340000 },
    { code: '350100', fullName: '福州市', quickQuery: 'Fuzhou', type: 2, sort: 1, status: 1, remark: '福州市', parentId: 350000 },
    { code: '350200', fullName: '厦门市', quickQuery: 'Xiamen', type: 2, sort: 2, status: 1, remark: '厦门市', parentId: 350000 },
    { code: '360100', fullName: '南昌市', quickQuery: 'Nanchang', type: 2, sort: 1, status: 1, remark: '南昌市', parentId: 360000 },
    { code: '370100', fullName: '济南市', quickQuery: 'Jinan', type: 2, sort: 1, status: 1, remark: '济南市', parentId: 370000 },
    { code: '370200', fullName: '青岛市', quickQuery: 'Qingdao', type: 2, sort: 2, status: 1, remark: '青岛市', parentId: 370000 },
    { code: '410100', fullName: '郑州市', quickQuery: 'Zhengzhou', type: 2, sort: 1, status: 1, remark: '郑州市', parentId: 410000 },
    { code: '410200', fullName: '开封市', quickQuery: 'Kaifeng', type: 2, sort: 2, status: 1, remark: '开封市', parentId: 410000 },
    { code: '420100', fullName: '武汉市', quickQuery: 'Wuhan', type: 2, sort: 1, status: 1, remark: '武汉市', parentId: 420000 },
    { code: '420200', fullName: '黄石市', quickQuery: 'Huangshi', type: 2, sort: 2, status: 1, remark: '黄石市', parentId: 420000 },
    { code: '430100', fullName: '长沙市', quickQuery: 'Changsha', type: 2, sort: 1, status: 1, remark: '长沙市', parentId: 430000 },
    { code: '430200', fullName: '株洲市', quickQuery: 'Zhuzhou', type: 2, sort: 2, status: 1, remark: '株洲市', parentId: 430000 },
    { code: '440100', fullName: '广州市', quickQuery: 'Guangzhou', type: 2, sort: 1, status: 1, remark: '广州市', parentId: 440000 },
    { code: '440200', fullName: '韶关市', quickQuery: 'Shaoguan', type: 2, sort: 2, status: 1, remark: '韶关市', parentId: 440000 },
    { code: '440300', fullName: '深圳市', quickQuery: 'Shenzhen', type: 2, sort: 3, status: 1, remark: '深圳市', parentId: 440000 },
    { code: '440400', fullName: '珠海市', quickQuery: 'Zhuhai', type: 2, sort: 4, status: 1, remark: '珠海市', parentId: 440000 },
    { code: '450100', fullName: '南宁市', quickQuery: 'Nanning', type: 2, sort: 1, status: 1, remark: '南宁市', parentId: 450000 },
    { code: '450200', fullName: '柳州市', quickQuery: 'Liuzhou', type: 2, sort: 2, status: 1, remark: '柳州市', parentId: 450000 },
    { code: '460100', fullName: '海口市', quickQuery: 'Haikou', type: 2, sort: 1, status: 1, remark: '海口市', parentId: 460000 },
    { code: '500100', fullName: '重庆市', quickQuery: 'Chongqing', type: 2, sort: 1, status: 1, remark: '重庆市', parentId: 500000 },
    { code: '510100', fullName: '成都市', quickQuery: 'Chengdu', type: 2, sort: 1, status: 1, remark: '成都市', parentId: 510000 },
    { code: '510300', fullName: '自贡市', quickQuery: 'Zigong', type: 2, sort: 2, status: 1, remark: '自贡市', parentId: 510000 },
    { code: '520100', fullName: '贵阳市', quickQuery: 'Guiyang', type: 2, sort: 1, status: 1, remark: '贵阳市', parentId: 520000 },
    { code: '530100', fullName: '昆明市', quickQuery: 'Kunming', type: 2, sort: 1, status: 1, remark: '昆明市', parentId: 530000 },
    { code: '610100', fullName: '西安市', quickQuery: 'Xian', type: 2, sort: 1, status: 1, remark: '西安市', parentId: 610000 },
    { code: '620100', fullName: '兰州市', quickQuery: 'Lanzhou', type: 2, sort: 1, status: 1, remark: '兰州市', parentId: 620000 },
    { code: '630100', fullName: '西宁市', quickQuery: 'Xining', type: 2, sort: 1, status: 1, remark: '西宁市', parentId: 630000 },
    { code: '640100', fullName: '银川市', quickQuery: 'Yinchuan', type: 2, sort: 1, status: 1, remark: '银川市', parentId: 640000 },
    { code: '650100', fullName: '乌鲁木齐市', quickQuery: 'Urumqi', type: 2, sort: 1, status: 1, remark: '乌鲁木齐市', parentId: 650000 },
    // 区县级（type=3）- 选取部分区县
    { code: '110101', fullName: '东城区', quickQuery: 'Dongcheng', type: 3, sort: 1, status: 1, remark: '东城区', parentId: 110100 },
    { code: '110102', fullName: '西城区', quickQuery: 'Xicheng', type: 3, sort: 2, status: 1, remark: '西城区', parentId: 110100 },
    { code: '110105', fullName: '朝阳区', quickQuery: 'Chaoyang', type: 3, sort: 3, status: 1, remark: '朝阳区', parentId: 110100 },
    { code: '110106', fullName: '丰台区', quickQuery: 'Fengtai', type: 3, sort: 4, status: 1, remark: '丰台区', parentId: 110100 },
    { code: '110107', fullName: '石景山区', quickQuery: 'Shijingshan', type: 3, sort: 5, status: 1, remark: '石景山区', parentId: 110100 },
    { code: '110108', fullName: '海淀区', quickQuery: 'Haidian', type: 3, sort: 6, status: 1, remark: '海淀区', parentId: 110100 },
    { code: '110109', fullName: '门头沟区', quickQuery: 'Mentougou', type: 3, sort: 7, status: 1, remark: '门头沟区', parentId: 110100 },
    { code: '110111', fullName: '房山区', quickQuery: 'Fangshan', type: 3, sort: 8, status: 1, remark: '房山区', parentId: 110100 },
    { code: '110112', fullName: '通州区', quickQuery: 'Tongzhou', type: 3, sort: 9, status: 1, remark: '通州区', parentId: 110100 },
    { code: '110113', fullName: '顺义区', quickQuery: 'Shunyi', type: 3, sort: 10, status: 1, remark: '顺义区', parentId: 110100 },
    { code: '310101', fullName: '黄浦区', quickQuery: 'Huangpu', type: 3, sort: 1, status: 1, remark: '黄浦区', parentId: 310100 },
    { code: '310104', fullName: '徐汇区', quickQuery: 'Xuhui', type: 3, sort: 3, status: 1, remark: '徐汇区', parentId: 310100 },
    { code: '310105', fullName: '长宁区', quickQuery: 'Changning', type: 3, sort: 4, status: 1, remark: '长宁区', parentId: 310100 },
    { code: '310106', fullName: '静安区', quickQuery: 'Jingan', type: 3, sort: 5, status: 1, remark: '静安区', parentId: 310100 },
    { code: '310107', fullName: '普陀区', quickQuery: 'Putuo', type: 3, sort: 6, status: 1, remark: '普陀区', parentId: 310100 },
    { code: '310109', fullName: '虹口区', quickQuery: 'Hongkou', type: 3, sort: 7, status: 1, remark: '虹口区', parentId: 310100 },
    { code: '310110', fullName: '杨浦区', quickQuery: 'Yangpu', type: 3, sort: 8, status: 1, remark: '杨浦区', parentId: 310100 },
    { code: '310112', fullName: '闵行区', quickQuery: 'Minhang', type: 3, sort: 9, status: 1, remark: '闵行区', parentId: 310100 },
    { code: '310113', fullName: '宝山区', quickQuery: 'Baoshan', type: 3, sort: 10, status: 1, remark: '宝山区', parentId: 310100 },
    { code: '440103', fullName: '荔湾区', quickQuery: 'Liwan', type: 3, sort: 1, status: 1, remark: '荔湾区', parentId: 440100 },
    { code: '440104', fullName: '越秀区', quickQuery: 'Yuexiu', type: 3, sort: 2, status: 1, remark: '越秀区', parentId: 440100 },
    { code: '440105', fullName: '海珠区', quickQuery: 'Haizhu', type: 3, sort: 3, status: 1, remark: '海珠区', parentId: 440100 },
    { code: '440106', fullName: '天河区', quickQuery: 'Tianhe', type: 3, sort: 4, status: 1, remark: '天河区', parentId: 440100 },
    { code: '440111', fullName: '白云区', quickQuery: 'Baiyun', type: 3, sort: 5, status: 1, remark: '白云区', parentId: 440100 },
    { code: '440112', fullName: '黄埔区', quickQuery: 'Huangpu', type: 3, sort: 6, status: 1, remark: '黄埔区', parentId: 440100 },
    { code: '440303', fullName: '罗湖区', quickQuery: 'Luohu', type: 3, sort: 1, status: 1, remark: '罗湖区', parentId: 440300 },
    { code: '440304', fullName: '福田区', quickQuery: 'Futian', type: 3, sort: 2, status: 1, remark: '福田区', parentId: 440300 },
    { code: '440305', fullName: '南山区', quickQuery: 'Nanshan', type: 3, sort: 3, status: 1, remark: '南山区', parentId: 440300 },
    { code: '440306', fullName: '宝安区', quickQuery: 'Baoan', type: 3, sort: 4, status: 1, remark: '宝安区', parentId: 440300 },
    { code: '440307', fullName: '龙岗区', quickQuery: 'Longgang', type: 3, sort: 5, status: 1, remark: '龙岗区', parentId: 440300 },
    { code: '440308', fullName: '盐田区', quickQuery: 'Yantian', type: 3, sort: 8, status: 1, remark: '盐田区', parentId: 440300 },
  ];

  for (const area of areas) {
    await prisma.cfgArea.upsert({
      where: { code: area.code },
      update: area,
      create: area,
    });
  }
  console.log(`行政区划已创建/更新: ${areas.length} 条`);

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
