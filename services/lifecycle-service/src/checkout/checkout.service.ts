import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AssetCheckedOutEvent } from '../events/asset-checked-out.event'; // Importa a interface do evento

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  /**
   * Publica um evento de checkout de ativo no RabbitMQ.
   * @param checkoutData - Dados do checkout contendo assetId e employeeId.
   */
  async publishCheckoutEvent(checkoutData: {
    assetId: number;
    employeeId: number;
  }): Promise<void> {
    const { assetId, employeeId } = checkoutData; // Desestrutura o objeto recebido

    // Validação básica dos dados de entrada (opcional, mas recomendado)
    if (!assetId || !employeeId) {
      this.logger.error('Dados de checkout inválidos ou ausentes', {
        assetId,
        employeeId,
      });
      throw new Error('assetId e employeeId são obrigatórios para checkout.'); // Ou use uma exceção específica do NestJS
    }

    const event: AssetCheckedOutEvent = {
      assetId,
      employeeId,
      timestamp: new Date().toISOString(), // Use ISOString para padronizar o formato da data
    };

    this.logger.log(
      `Publicando evento de checkout para ativo ${assetId} e funcionário ${employeeId}.`,
    );

    try {
      // Publica o evento na exchange 'asset_events' com a routing key 'asset.checked.out'
      // O ClientProxy deve estar configurado para usar a exchange correta (feito no AppModule)
      await this.client
        .emit<AssetCheckedOutEvent>('asset.checked.out', event)
        .toPromise();

      this.logger.log(
        `Evento de checkout para ativo ${assetId} publicado com sucesso.`,
      );
    } catch (error: unknown) {
      // Tipa o erro como unknown
      this.logger.error(
        `Falha ao publicar evento de checkout para ativo ${assetId}:`,
        error,
      );
      // Trate o erro conforme necessário (lançar exceção, registrar alerta, etc.)
      throw error; // Relança o erro para que o controlador possa lidar
    }
  }
}
