import { registerAs } from '@nestjs/config';

export default registerAs('production', () => ({
  port: parseInt(process.env.PORT || '8081', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: 'warn',
}));
