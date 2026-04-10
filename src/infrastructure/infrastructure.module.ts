import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './cache/redis.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/sdk/storage.module';
import { LockModule } from './lock/lock.module';
import { HttpClientModule } from './http/http-client.module';
import { CoreModule } from './core/core.module';
import { OAuthModule } from './oauth/oauth.module';
import { PayModule } from './pay/pay.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    RedisModule,
    QueueModule,
    StorageModule,
    LockModule,
    HttpClientModule,
    CoreModule,
    OAuthModule,
    PayModule,
  ],
  exports: [
    PrismaModule,
    RedisModule,
    QueueModule,
    StorageModule,
    LockModule,
    HttpClientModule,
    CoreModule,
    OAuthModule,
    PayModule,
  ],
})
export class InfrastructureModule {}
