import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { ClientsModule, Transport } from '@nestjs/microservices'; // Importe ClientsModule e Transport

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT', // Nome do provedor que será injetado
        transport: Transport.RMQ, // Tipo de transporte
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672',
          ], // Tente ler de variável de ambiente
          queue: 'lifecycle_publisher_temp', // Fila exclusiva para o publisher (não é a fila de consumo)
          queueOptions: {
            exclusive: true, // Garante que a fila é apagada quando a conexão fecha
          },
          exchange: 'asset_events', // Nome da exchange para onde enviar
          exchangeType: 'direct', // Tipo da exchange
        },
      },
    ]),
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
