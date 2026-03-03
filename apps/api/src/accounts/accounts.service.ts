import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { DB_CONNECTION } from '../db/db.connection';
import * as schema from './schema';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  async create(createAccountDto: CreateAccountDto) {
    const [account] = await this.db
      .insert(schema.accounts)
      .values(createAccountDto)
      .returning();
    return account;
  }

  findAll() {
    return this.db.select().from(schema.accounts);
  }

  async findOne(id: string) {
    const [account] = await this.db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.id, id));
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    const [account] = await this.db
      .update(schema.accounts)
      .set({ ...updateAccountDto, updatedAt: new Date() })
      .where(eq(schema.accounts.id, id))
      .returning();
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  async remove(id: string) {
    const [account] = await this.db
      .delete(schema.accounts)
      .where(eq(schema.accounts.id, id))
      .returning();
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }
}
