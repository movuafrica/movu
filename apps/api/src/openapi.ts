import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from './app.module';
import { buildOpenApiDocument } from './openapi-document';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const document = buildOpenApiDocument(app);

  const outputPath = resolve(__dirname, '..', 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.log(`OpenAPI schema written to ${outputPath}`);

  await app.close();
}

void generate();
