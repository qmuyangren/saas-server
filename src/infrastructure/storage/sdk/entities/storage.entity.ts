/**
 * 文件信息
 */
export interface FileInfo {
  /**
   * 文件ID
   */
  id: string;

  /**
   * 原始文件名
   */
  originalName: string;

  /**
   * 文件大小（字节）
   */
  size: number;

  /**
   * 文件MIME类型
   */
  mimeType: string;

  /**
   * 文件存储路径
   */
  path: string;

  /**
   * 文件访问URL
   */
  url: string;

  /**
   * 文件MD5值
   */
  md5?: string;

  /**
   * 文件存储类型: local, oss, qiniu
   */
  storageType: 'local' | 'oss' | 'qiniu';

  /**
   * 上传时间
   */
  uploadTime: Date;
}

/**
 * 上传配置
 */
export interface UploadConfig {
  /**
   * 存储类型: local, oss, qiniu
   */
  storageType: 'local' | 'oss' | 'qiniu';

  /**
   * 本地存储路径
   */
  localPath?: string;

  /**
   * OSS配置
   */
  oss?: {
    endpoint: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucketName: string;
    bucketUrl: string;
  };

  /**
   * 七牛云配置
   */
  qiniu?: {
    accessKey: string;
    secretKey: string;
    bucket: string;
    domain: string;
    region: string;
  };

  /**
   * 文件大小限制（字节）
   */
  maxSize?: number;

  /**
   * 允许的文件类型
   */
  allowedTypes?: string[];
}
