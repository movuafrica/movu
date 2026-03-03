import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { DbModule } from './db/db.module';
import { SeedsModule } from './seeds/seeds.module';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from './common/auth/clerk-auth.guard';

@Module({
  imports: [
    AccountsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    SeedsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule { }
