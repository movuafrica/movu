import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const accountKindEnum = pgEnum('AccountKind', ['PERSONAL', 'BUSINESS']);

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull(),
  kind: accountKindEnum('kind').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
