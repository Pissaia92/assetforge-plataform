import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o CORS, permitindo que nosso frontend se comunique com este backend.
  app.enableCors();

  await app.listen(3000);
}
bootstrap();