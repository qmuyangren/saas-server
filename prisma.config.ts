import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: 'mysql://root:qxsj@2025@8.148.22.71:3306/practice05',
  },
});
