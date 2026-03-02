import { Injectable } from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';

@Injectable()
export class AccountsSeed {
  constructor(private readonly accounts: AccountsService) { }
}
