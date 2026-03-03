import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { buildOpenApiDocument } from './openapi-document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const document = buildOpenApiDocument(app);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
