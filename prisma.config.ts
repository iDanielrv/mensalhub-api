import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7: config de schema/migrations/datasource fora do schema.prisma.
// O .env precisa ser carregado explicitamente (import acima).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
