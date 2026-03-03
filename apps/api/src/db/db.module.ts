import { Global, Module } from '@nestjs/common';
import { DB_CONNECTION } from './db.connection';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as accountSchema from '../accounts/schema';

@Global()
@Module({
  providers: [
    {
      provide: DB_CONNECTION,
      useFactory(configService: ConfigService) {
        const pool = new Pool({
          connectionString: configService.getOrThrow('DATABASE_URL'),
        });

        return drizzle(pool, {
          schema: {
            ...accountSchema,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DB_CONNECTION],
})
export class DbModule {}
