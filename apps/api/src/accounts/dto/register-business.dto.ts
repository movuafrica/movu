import { RegisterBusinessSchema } from '@workspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class RegisterBusinessDto extends createZodDto(RegisterBusinessSchema) {}
