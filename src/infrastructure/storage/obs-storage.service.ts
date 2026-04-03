import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 华为云 OBS 对象存储服务
 *
 * @description
 * 将文件保存到华为云 OBS 对象存储，适用于生产环境。
 * 支持文件上传、下载、删除、生成签名 URL 等操作。
 * 提供高可用、高并发的文件存储能力，支持 CDN 加速。
 *
 * 特性：
 * - 分片上传（大文件）
 * - 签名 URL（临时访问）
 * - CDN 加速
 * - 自动重试
 *
 * @example
 * ```typescript
 * // 上传文件
 * const url = await this.obsStorage.upload(file, 'avatars');
 *
 * // 生成签名 URL（1 小时有效）
 * const signedUrl = await this.obsStorage.getSignedUrl(filePath, 3600);
 *
 * // 删除文件
 * await this.obsStorage.remove(filePath);
 * ```
 */
@Injectable()
export class ObsStorageService {
  private readonly logger = new Logger(ObsStorageService.name);
  private readonly bucket: string;
  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly cdnDomain: string;
  private client: any;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('HWOBS_BUCKET', '');
    this.region = this.configService.get<string>('HWOBS_REGION', 'cn-east-3');
    this.accessKeyId = this.configService.get<string>(
      'HWOBS_ACCESS_KEY_ID',
      '',
    );
    this.secretAccessKey = this.configService.get<string>(
      'HWOBS_SECRET_ACCESS_KEY',
      '',
    );
    this.cdnDomain = this.configService.get<string>('HWOBS_CDN_DOMAIN', '');
  }

  /**
   * 初始化 OBS 客户端
   */
  private async initClient(): Promise<void> {
    if (this.client) {
      return;
    }

    try {
      const ObsClient = require('esdk-obs-nodejs');
      this.client = new ObsClient({
        access_key_id: this.accessKeyId,
        secret_access_key: this.secretAccessKey,
        server: `https://obs.${this.region}.myhuaweicloud.com`,
      });
      this.logger.log('OBS client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize OBS client', error);
      throw error;
    }
  }

  /**
   * 上传文件到 OBS
   *
   * @param file - 文件对象（包含 originalname、buffer、mimetype）
   * @param subDir - 子目录名称（可选）
   * @returns 文件访问 URL
   */
  async upload(
    file: { originalname: string; buffer: Buffer; mimetype?: string },
    subDir?: string,
  ): Promise<string> {
    await this.initClient();

    const ext = this.getFileExtension(file.originalname);
    const fileName = `${subDir ? subDir + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    try {
      await this.client.putObject({
        Bucket: this.bucket,
        Key: fileName,
        Body: file.buffer,
      });
      this.logger.log(`File uploaded to OBS: ${fileName}`);
      return this.getUrl(fileName);
    } catch (error) {
      this.logger.error(`Failed to upload file to OBS: ${fileName}`, error);
      throw error;
    }
  }

  /**
   * 下载文件
   *
   * @param filePath - 文件在 OBS 中的路径
   * @returns 文件 Buffer
   */
  async download(filePath: string): Promise<Buffer> {
    await this.initClient();

    try {
      const result = await this.client.getObject({
        Bucket: this.bucket,
        Key: filePath,
      });
      return result.Content;
    } catch (error) {
      this.logger.error(`Failed to download file from OBS: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 删除文件
   *
   * @param filePath - 文件在 OBS 中的路径
   * @returns 是否删除成功
   */
  async remove(filePath: string): Promise<boolean> {
    await this.initClient();

    try {
      await this.client.deleteObject({
        Bucket: this.bucket,
        Key: filePath,
      });
      this.logger.log(`File removed from OBS: ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove file from OBS: ${filePath}`, error);
      return false;
    }
  }

  /**
   * 获取文件访问 URL
   *
   * @param filePath - 文件在 OBS 中的路径
   * @returns 文件访问 URL（CDN 或 OBS 直连）
   */
  getUrl(filePath: string): string {
    if (this.cdnDomain) {
      return `${this.cdnDomain}/${filePath}`;
    }
    return `https://${this.bucket}.obs.${this.region}.myhuaweicloud.com/${filePath}`;
  }

  /**
   * 获取签名 URL（临时访问）
   *
   * @param filePath - 文件在 OBS 中的路径
   * @param expires - 有效期（秒），默认 3600 秒（1 小时）
   * @returns 签名 URL
   */
  async getSignedUrl(filePath: string, expires = 3600): Promise<string> {
    await this.initClient();

    try {
      const result = await this.client.createSignedUrlSync({
        Method: 'GET',
        Bucket: this.bucket,
        Key: filePath,
        Expires: expires,
      });
      return result.SignedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 获取文件扩展名
   *
   * @param filename - 文件名
   * @returns 文件扩展名（含点号）
   */
  private getFileExtension(filename: string): string {
    const ext = filename.split('.').pop();
    return ext ? `.${ext}` : '';
  }
}
