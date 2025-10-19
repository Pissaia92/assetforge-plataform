import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Inicializa como um microserviço que se conecta ao RabbitMQ
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        // Lê a URL de uma variável de ambiente (definida no docker-compose.yml)
        urls: [
          process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672',
        ],
        queue: 'lifecycle_publisher_temp', // Fila exclusiva para o publisher
        queueOptions: {
          exclusive: true,
        },
        exchange: 'asset_events', // Nome da exchange
        exchangeType: 'direct', // Tipo da exchange
      },
    },
  );
  await app.listen();
  console.log('Lifecycle Service (Microservice) is listening to RabbitMQ...');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
