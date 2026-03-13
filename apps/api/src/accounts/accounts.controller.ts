import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { RegisterBusinessDto } from './dto/register-business.dto';
import { CurrentAuth } from '../common/auth/current-auth.decorator';
import type { ClerkAuthContext } from '@workspace/schemas';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Get('me')
  findMe(@CurrentAuth() auth: ClerkAuthContext) {
    return this.accountsService.findByUserId(auth.userId);
  }

  @Patch('me')
  updateMe(
    @CurrentAuth() auth: ClerkAuthContext,
    @Body() dto: RegisterBusinessDto,
  ) {
    return this.accountsService.upsertCurrentBusinessAccount(auth.userId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
