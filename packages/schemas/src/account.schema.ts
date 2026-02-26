import { z } from "zod";

export const AccountKind = z.enum(["bussiness", "personal"]);
export type AccountKind = z.infer<typeof AccountKind>;

export const AccountSchema = z.object({
  id: z.uuid(),
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
}).meta({
  id: "CreateAccount"
})
export type CreateAccount = z.infer<typeof CreateAccountSchema>;


export const UpdateAccountSchema = CreateAccountSchema.partial().meta({
  id: "UpdateAccount"
})
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;

export const UserResponse = AccountSchema.meta({
  id: "UserResponse"
})
