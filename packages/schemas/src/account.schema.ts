import { z } from "zod";

export const AccountKind = z.enum(["BUSINESS", "PERSONAL"]);
export type AccountKind = z.infer<typeof AccountKind>;

export const TradeRole = z.enum([
  "IMPORTER",
  "EXPORTER",
  "FREIGHT_FORWARDER",
  "CUSTOMS_BROKER",
  "MANUFACTURER",
  "DISTRIBUTOR",
  "TRADER",
]);
export type TradeRole = z.infer<typeof TradeRole>;

export const RegisterBusinessSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  country: z.string().min(1),
  businessName: z.string().min(1),
  businessRegistrationNumber: z.string().min(1),
  taxId: z.string().min(1),
  address: z.string().min(1),
  postalCode: z.string().min(1),
  city: z.string().min(1),
  tradeRole: TradeRole,
}).meta({
  id: "RegisterBusiness"
});
export type RegisterBusiness = z.infer<typeof RegisterBusinessSchema>;

const NullableBusinessProfileFieldsSchema = z.object({
  fullName: z.string().nullable(),
  email: z.email().nullable(),
  phoneNumber: z.string().nullable(),
  country: z.string().nullable(),
  businessName: z.string().nullable(),
  businessRegistrationNumber: z.string().nullable(),
  taxId: z.string().nullable(),
  address: z.string().nullable(),
  postalCode: z.string().nullable(),
  city: z.string().nullable(),
  tradeRole: TradeRole.nullable(),
});

export const AccountSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  kind: AccountKind,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  ...NullableBusinessProfileFieldsSchema.shape,
}).meta({
  id: "Account"
})
export type Account = z.infer<typeof AccountSchema>;

export const CreateAccountSchema = z.object({
  userId: z.string(),
  kind: AccountKind,
}).meta({
  id: "CreateAccount"
})
export type CreateAccount = z.infer<typeof CreateAccountSchema>;


export const UpdateAccountSchema = z.object({
  userId: z.string().optional(),
  kind: AccountKind.optional(),
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  businessName: z.string().min(1).optional(),
  businessRegistrationNumber: z.string().min(1).optional(),
  taxId: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  tradeRole: TradeRole.optional(),
}).meta({
  id: "UpdateAccount"
})
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;

export const AccountResponseSchema = AccountSchema.meta({
  id: "AccountResponse"
})
export type AccountResponse = z.infer<typeof AccountResponseSchema>;
