import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { AccountsSeed } from './domains/accounts.seed';
import { AccountsModule } from '../../accounts/accounts.module';

@Module({
  imports: [AccountsModule],
  providers: [SeedsService, AccountsSeed],
})
export class SeedsModule { }
