import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { PrismaModule } from './prisma.module';
import { SeedsModule } from './seeds/seeds.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from './common/auth/clerk-auth.guard';

@Module({
  imports: [
    AccountsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SeedsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule { }
