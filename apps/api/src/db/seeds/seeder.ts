import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedsService } from './seeds.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedsService);
  await seedService.run();
  await app.close();
}

bootstrap();
