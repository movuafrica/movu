import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { accounts } from '../db/schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly db: DbService) { }

  async create(createAccountDto: CreateAccountDto) {
    const [account] = await this.db.db
      .insert(accounts)
      .values(createAccountDto)
      .returning();
    return account;
  }

  findAll() {
    return this.db.db.select().from(accounts);
  }

  async findOne(id: string) {
    const [account] = await this.db.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id));
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    const [account] = await this.db.db
      .update(accounts)
      .set({ ...updateAccountDto, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  async remove(id: string) {
    const [account] = await this.db.db
      .delete(accounts)
      .where(eq(accounts.id, id))
      .returning();
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }
}
