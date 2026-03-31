import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { LoginLog } from '../modules/auth/entities/login-log.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'app',
  entities: [User, LoginLog],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
