import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(authDto: AuthDto) {
    const hash = await argon.hash(authDto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: authDto.email,
          hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        if (error.code === 'P2002')
          throw new BadRequestException('Credentials already in use');

      throw error;
    }
  }

  async login(authDto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: authDto.email,
      },
    });
    if (!user) throw new BadRequestException('Invalid credentials');

    const pwMatches = await argon.verify(user.hash, authDto.password);
    if (!pwMatches) throw new BadRequestException('Invalid credentials');

    return this.signToken(user.id, user.email);
  }

  signToken(userId: number, email: string): { token: string } {
    const payload = {
      sub: userId,
      email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });

    return {
      token,
    };
  }
}
