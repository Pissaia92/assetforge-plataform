import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Employee } from '@prisma/client'; // Importa o tipo 'Employee'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<Omit<Employee, 'password'>> {
    const { email, name, password, departmentId } = signUpDto;

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new BadRequestException(
        `Department with ID ${departmentId} not found.`,
      );
    }

    const existingEmployee = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmployee) {
      throw new ConflictException(`Email "${email}" is already in use.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await this.prisma.employee.create({
      // Usei 'newEmployee' para evitar confusão com a instância do login
      data: {
        email,
        name,
        password: hashedPassword,
        departmentId,
      },
    });

    const { password: _, ...result } = newEmployee;
    return result;
  }

  // O método de login
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Busca o funcionário pelo email
    const employee = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compara a senha fornecida com a senha armazenada
    const isPasswordMatching = await bcrypt.compare(
      password,
      employee.password, // Usa a instância 'employee', não o tipo 'Employee'
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Cria o payload do JWT usando os dados da instância 'employee' encontrada
    const payload = {
      sub: employee.id.toString(), // <-- CORREÇÃO: Use 'employee.id', não 'Employee.id'
      email: employee.email, // <-- CORREÇÃO: Use 'employee.email', não 'Employee.email'
    };

    // Retorna o token de acesso gerado
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
