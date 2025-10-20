import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  console.log('Antes de app.listen'); // <-- Este log é útil para debug
  await app.listen(process.env.PORT || 3000);
  console.log('Lifecycle Service (HTTP Server) is listening on port 3000...');
}
void bootstrap();
