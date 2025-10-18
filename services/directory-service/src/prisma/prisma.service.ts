import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Garante que a conexão com o banco seja estabelecida na inicialização
  async onModuleInit() {
    await this.$connect();
  }

  // Garante que a conexão seja fechada ao desligar a aplicação
  async onModuleDestroy() {
    await this.$disconnect();
  }
}