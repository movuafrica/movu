import { UpdateAccountSchema } from '@workspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class UpdateAccountDto extends createZodDto(UpdateAccountSchema) { }
