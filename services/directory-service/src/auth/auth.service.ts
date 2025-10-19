// src/auth/auth.service.ts
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
import { Employee } from '@prisma/client';
import { JwtService } from '@nestjs/jwt'; // O serviço que será injetado

@Injectable()
export class AuthService {
  // O construtor agora recebe ambos os serviços
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // O método signUp permanece o mesmo...
  async signUp(
    signUpDto: SignUpDto,
  ): Promise<Omit<Employee, 'password'>> {
    const { email, name, password, departmentId } = signUpDto;

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new BadRequestException(`Department with ID ${departmentId} not found.`);
    }

    const existingEmployee = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmployee) {
      throw new ConflictException(`Email "${email}" is already in use.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await this.prisma.employee.create({
      data: {
        email,
        name,
        password: hashedPassword,
        departmentId,
      },
    });

    const { password: _, ...result } = employee;
    return result;
  }

  // O método de login
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const employee = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, employee.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: newEmployee.id.toString(), email: newEmployee.email };

    // Retorna o token de acesso
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}