import { Controller, Get } from '@nestjs/common';

@Controller('accounts')
export class AccountsController {
  @Get()
  findAll(): string {
    return 'This action returns all accounts';
  }
}
