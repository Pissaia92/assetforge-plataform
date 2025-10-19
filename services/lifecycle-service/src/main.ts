import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Inicializa como um SERVIDOR HTTP padrão
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000); // Ouvindo na porta 3000 dentro do container ou localmente
  console.log('Lifecycle Service (HTTP Server) is listening on port 3000...');
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
