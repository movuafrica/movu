import { CreateAccountSchema } from "@workspace/schemas";
import { createZodDto } from "nestjs-zod";


export class CreateAccountDto extends createZodDto(CreateAccountSchema) { }
