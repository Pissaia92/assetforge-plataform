import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT', // Nome do cliente
        transport: Transport.RMQ, // Tipo de transporte
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672',
          ], // URL do RabbitMQ (mesma do docker-compose)
          queue: 'lifecycle_publisher_temp', // Fila exclusiva para o publisher
          queueOptions: { exclusive: true },
          exchange: 'asset_events',
          exchangeType: 'direct',
        },
      },
    ]),
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
