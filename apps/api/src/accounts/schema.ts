import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const accountKindEnum = pgEnum('AccountKind', ['PERSONAL', 'BUSINESS']);

export const tradeRoleEnum = pgEnum('TradeRole', [
  'IMPORTER',
  'EXPORTER',
  'FREIGHT_FORWARDER',
  'CUSTOMS_BROKER',
  'MANUFACTURER',
  'DISTRIBUTOR',
  'TRADER',
]);

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull().unique(),
  kind: accountKindEnum('kind').notNull(),
  fullName: text('fullName'),
  email: text('email'),
  phoneNumber: text('phoneNumber'),
  country: text('country'),
  businessName: text('businessName'),
  businessRegistrationNumber: text('businessRegistrationNumber'),
  taxId: text('taxId'),
  address: text('address'),
  postalCode: text('postalCode'),
  city: text('city'),
  tradeRole: tradeRoleEnum('tradeRole'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
