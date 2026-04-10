import { Logger } from '@nestjs/common';

/**
 * 外部服务基类
 *
 * @description
 * 提供统一的外部服务封装基类，包含：
 * - 配置管理
 * - 状态检测
 * - 模拟模式支持
 * - 配置热更新
 * - 单例模式
 */
export abstract class BaseExternalService<T = any> {
  private logger: Logger;

  /**
   * 配置对象
   */
  protected config: T | null = null;

  /**
   * 配置是否完整
   */
  protected isConfigured: boolean = false;

  /**
   * 配置键名（子类实现）
   */
  protected abstract configKey: string;

  /**
   * 配置项列表（子类实现）
   */
  protected abstract requiredConfigKeys: string[];

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * 获取 logger
   */
  protected getLogger(): Logger {
    return this.logger;
  }

  /**
   * 初始化服务
   * @param config 配置对象
   */
  public async initialize(config?: T | null): Promise<void> {
    if (config) {
      this.config = config;
    }
    this.isConfigured = this.checkConfig();
    if (this.isConfigured) {
      this.logger.log(`服务配置已加载: ${this.configKey}`);
    } else {
      this.logger.warn(`服务配置缺失: ${this.configKey}，将使用模拟模式`);
    }
  }

  /**
   * 重新加载配置
   * 调用后会重新读取配置并更新 isConfigured 状态
   * @param config 配置对象
   */
  public async reloadConfig(config?: T | null): Promise<void> {
    if (config) {
      this.config = config;
    }
    this.isConfigured = this.checkConfig();
    if (this.isConfigured) {
      this.logger.log(`配置已重新加载: ${this.configKey}`);
    } else {
      this.logger.warn(`配置仍缺失: ${this.configKey}，将继续使用模拟模式`);
    }
  }

  /**
   * 检查配置是否完整
   */
  protected checkConfig(): boolean {
    if (!this.config) {
      return false;
    }
    return this.requiredConfigKeys.every(
      (key) => (this.config as any)[key] && (this.config as any)[key].toString().trim() !== '',
    );
  }

  /**
   * 获取配置是否完整的状态
   */
  public isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * 获取配置对象
   */
  public getConfig(): T | null {
    return this.config;
  }

  /**
   * 获取服务名称
   */
  public getServiceName(): string {
    return this.constructor.name;
  }

  /**
   * 记录配置缺失警告并返回模拟数据
   */
  protected handleMissingConfig<TResult>(result?: TResult): TResult {
    this.logger.warn(`配置缺失，使用模拟模式: ${this.configKey}`);
    return result as TResult;
  }
}
