import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private connected = false;

  constructor(private readonly configService: ConfigService) {}

  async connect(): Promise<void> {
    const host = this.configService.get<string>('QUEUE_HOST', 'localhost');
    const port = this.configService.get<number>('QUEUE_PORT', 5672);
    this.logger.log(`Queue connecting to ${host}:${port}`);
    this.connected = true;
  }

  async publish(queue: string, message: any): Promise<boolean> {
    if (!this.connected) {
      this.logger.warn('Queue not connected');
      return false;
    }
    this.logger.log(`Publishing to queue ${queue}: ${JSON.stringify(message)}`);
    return true;
  }

  async consume(queue: string, handler: (message: any) => void): Promise<void> {
    if (!this.connected) {
      this.logger.warn('Queue not connected');
      return;
    }
    this.logger.log(`Consuming from queue ${queue}`);
  }

  isConnected(): boolean {
    return this.connected;
  }
}
