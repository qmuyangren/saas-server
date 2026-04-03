import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './cache/redis.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';
import { LockModule } from './lock/lock.module';
import { HttpClientModule } from './http/http-client.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    RedisModule,
    QueueModule,
    StorageModule,
    LockModule,
    HttpClientModule,
  ],
  exports: [
    PrismaModule,
    RedisModule,
    QueueModule,
    StorageModule,
    LockModule,
    HttpClientModule,
  ],
})
export class InfrastructureModule {}
