import { createZodDto } from 'nestjs-zod';
import { AccountResponseSchema } from '@workspace/schemas';

export class AccountResponseDto extends createZodDto(AccountResponseSchema) {}
