import { registerAs } from '@nestjs/config';

export default registerAs('development', () => ({
  port: parseInt(process.env.PORT || '8081', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  logLevel: 'debug',
}));
