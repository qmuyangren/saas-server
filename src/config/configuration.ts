import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '8081', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
}));
