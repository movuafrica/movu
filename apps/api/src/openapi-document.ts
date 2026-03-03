import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Movu API')
    .setDescription('Backend for all movu services')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Use a Clerk session token (Authorization: Bearer <token>).',
      },
      'clerkSession',
    )
    .addSecurityRequirements('clerkSession')
    .build();

  return cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));
}
