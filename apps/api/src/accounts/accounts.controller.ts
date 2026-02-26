import { Body, Controller, Get, Post } from '@nestjs/common';
import { Account } from '@workspace/schemas';
import { AccountResponseDto } from './dto/account-response.dto';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
  @Get()
  findAll(): AccountResponseDto[] {
    const accounts: Account[] = []

    console.log(accounts)
    return accounts
  }

  @Post()
  create(@Body() createAccountDto: CreateAccountDto): AccountResponseDto {
    return {
      ...createAccountDto,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
}
