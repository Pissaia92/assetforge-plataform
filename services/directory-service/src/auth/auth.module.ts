import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    // Garante que o JwtModule está configurado e disponível globalmente
    JwtModule.register({
      secret: 'SEU_SEGREDO_SUPER_SECRETO', // Use uma chave forte e de um .env em produção
      signOptions: { expiresIn: '1h' }, // Aumentei para 1 hora
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService], // O AuthService é o provedor principal deste módulo
})
export class AuthModule {}