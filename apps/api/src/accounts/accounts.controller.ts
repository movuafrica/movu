import { Controller, Get } from '@nestjs/common';
import { Account } from '@workspace/schemas';

@Controller('accounts')
export class AccountsController {
  @Get()
  findAll(): string {

    const accounts: Account[] = []
    return `This action returns all accounts: ${accounts.length} accounts found.`;
  }
}
