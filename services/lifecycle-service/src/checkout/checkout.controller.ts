import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';

interface CheckoutRequestDto {
  assetId: number;
  employeeId: number;
}

@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.OK) // Ou CREATED, dependendo da semântica desejada
  async checkoutAsset(@Body() checkoutData: CheckoutRequestDto) {
    const { assetId, employeeId } = checkoutData;

    // Validação básica (opcional, mas recomendado no controller também)
    if (!assetId || !employeeId) {
      this.logger.error(
        'Dados de checkout inválidos ou ausentes no body',
        checkoutData,
      );
      return { message: 'assetId e employeeId são obrigatórios.' };
    }

    this.logger.log(
      `Recebido pedido de checkout para ativo ${assetId} e funcionário ${employeeId}.`,
    );

    try {
      // Chama o serviço passando um objeto único
      await this.checkoutService.publishCheckoutEvent({ assetId, employeeId });
      return {
        message: 'Checkout request received and event published.',
        checkoutData,
      };
    } catch (error: unknown) {
      // Tipa o erro como unknown
      this.logger.error(
        `Falha ao processar checkout para ativo ${assetId}:`,
        error,
      );
      // Retorne um erro adequado para o cliente
      // Verifica se 'error' é um objeto com uma propriedade 'message'
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao processar o checkout.';
      return { message: 'Falha ao processar o checkout.', error: errorMessage };
    }
  }
}
