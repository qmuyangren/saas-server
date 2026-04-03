import { registerAs } from '@nestjs/config';

export default registerAs('test', () => ({
  port: 0,
  corsOrigin: '*',
  logLevel: 'silent',
}));
