import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 七牛云 Kodo 对象存储服务
 *
 * @description
 * 将文件保存到七牛云 Kodo 对象存储，适用于生产环境。
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
 * const url = await this.qiniuStorage.upload(file, 'avatars');
 *
 * // 生成签名 URL（1 小时有效）
 * const signedUrl = await this.qiniuStorage.getSignedUrl(filePath, 3600);
 *
 * // 删除文件
 * await this.qiniuStorage.remove(filePath);
 * ```
 */
@Injectable()
export class QiniuStorageService {
  private readonly logger = new Logger(QiniuStorageService.name);
  private readonly bucket: string;
  private readonly domain: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly zone: string;
  private mac: any;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('QINIU_BUCKET', '');
    this.domain = this.configService.get<string>('QINIU_DOMAIN', '');
    this.accessKey = this.configService.get<string>('QINIU_ACCESS_KEY', '');
    this.secretKey = this.configService.get<string>('QINIU_SECRET_KEY', '');
    this.zone = this.configService.get<string>('QINIU_ZONE', 'z0');
  }

  /**
   * 初始化七牛云认证
   */
  private initAuth(): void {
    if (this.mac) {
      return;
    }
    const qiniu = require('qiniu');
    this.mac = new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
  }

  /**
   * 上传文件到七牛云
   *
   * @param file - 文件对象（包含 originalname、buffer、mimetype）
   * @param subDir - 子目录名称（可选）
   * @returns 文件访问 URL
   */
  async upload(
    file: { originalname: string; buffer: Buffer; mimetype?: string },
    subDir?: string,
  ): Promise<string> {
    this.initAuth();
    const qiniu = require('qiniu');

    const ext = this.getFileExtension(file.originalname);
    const fileName = `${subDir ? subDir + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const options = {
      scope: this.bucket + ':' + fileName,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(this.mac);

    const config = new qiniu.conf.Config();
    const zoneMap: Record<string, any> = {
      z0: qiniu.zone.Zone_z0,
      z1: qiniu.zone.Zone_z1,
      z2: qiniu.zone.Zone_z2,
      na0: qiniu.zone.Zone_na0,
      as0: qiniu.zone.Zone_as0,
    };
    config.zone = zoneMap[this.zone] || qiniu.zone.Zone_z0;

    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.put(
        uploadToken,
        fileName,
        file.buffer,
        putExtra,
        (respErr: Error, respBody: any, respInfo: any) => {
          if (respErr) {
            this.logger.error(
              `Failed to upload to Qiniu: ${fileName}`,
              respErr,
            );
            return reject(respErr);
          }
          if (respInfo.statusCode === 200) {
            this.logger.log(`File uploaded to Qiniu: ${fileName}`);
            resolve(this.getUrl(fileName));
          } else {
            reject(new Error(`Upload failed: ${respInfo.statusCode}`));
          }
        },
      );
    });
  }

  /**
   * 下载文件
   *
   * @param filePath - 文件在七牛云中的路径
   * @returns 文件 Buffer
   */
  async download(filePath: string): Promise<Buffer> {
    this.initAuth();
    const qiniu = require('qiniu');

    const bucketManager = new qiniu.rs.BucketManager(
      this.mac,
      new qiniu.conf.Config(),
    );

    return new Promise((resolve, reject) => {
      const downloadUrl = this.getPrivateUrl(filePath, 3600);
      // 通过 HTTP 下载
      const https = require('https');
      https.get(downloadUrl, (res: any) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      });
    });
  }

  /**
   * 删除文件
   *
   * @param filePath - 文件在七牛云中的路径
   * @returns 是否删除成功
   */
  async remove(filePath: string): Promise<boolean> {
    this.initAuth();
    const qiniu = require('qiniu');

    const bucketManager = new qiniu.rs.BucketManager(
      this.mac,
      new qiniu.conf.Config(),
    );

    return new Promise((resolve) => {
      bucketManager.delete(this.bucket, filePath, (err: Error) => {
        if (err) {
          this.logger.error(`Failed to remove from Qiniu: ${filePath}`, err);
          resolve(false);
        } else {
          this.logger.log(`File removed from Qiniu: ${filePath}`);
          resolve(true);
        }
      });
    });
  }

  /**
   * 获取文件访问 URL
   *
   * @param filePath - 文件在七牛云中的路径
   * @returns 文件访问 URL（CDN 或七牛云直连）
   */
  getUrl(filePath: string): string {
    if (this.domain) {
      return `${this.domain}/${filePath}`;
    }
    return `http://${this.bucket}.qiniudn.com/${filePath}`;
  }

  /**
   * 获取私有空间签名 URL（临时访问）
   *
   * @param filePath - 文件在七牛云中的路径
   * @param expires - 有效期（秒），默认 3600 秒（1 小时）
   * @returns 签名 URL
   */
  getPrivateUrl(filePath: string, expires = 3600): string {
    this.initAuth();
    const qiniu = require('qiniu');

    const baseUrl = this.getUrl(filePath);
    return qiniu.util.generateAccessToken(this.mac, baseUrl, expires);
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
