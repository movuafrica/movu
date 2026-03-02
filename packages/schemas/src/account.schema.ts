import { z } from "zod";

export const AccountKind = z.enum(["BUSINESS", "PERSONAL"]);
export type AccountKind = z.infer<typeof AccountKind>;

export const AccountSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  kind: AccountKind,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).meta({
  id: "Account"
})
export type Account = z.infer<typeof AccountSchema>;

export const CreateAccountSchema = AccountSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).meta({
  id: "CreateAccount"
})
export type CreateAccount = z.infer<typeof CreateAccountSchema>;


export const UpdateAccountSchema = CreateAccountSchema.partial().meta({
  id: "UpdateAccount"
})
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;

export const AccountResponseSchema = AccountSchema.meta({
  id: "AccountResponse"
})
export type AccountResponse = z.infer<typeof AccountResponseSchema>;
