import { Body, Controller, Get, Post } from '@nestjs/common';
import { Account } from '@workspace/schemas';
import { AccountResponseDto } from './dto/account-response.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('accounts')
@ApiTags()
export class AccountsController {
  @Get()
  @ApiOperation({ summary: 'Find all accounts' })
  findAll(): AccountResponseDto[] {
    const accounts: Account[] = [];

    console.log(accounts);
    return accounts;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  create(@Body() createAccountDto: CreateAccountDto): AccountResponseDto {
    return {
      ...createAccountDto,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
