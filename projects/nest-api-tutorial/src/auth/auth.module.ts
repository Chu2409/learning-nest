import { Module } from '@nestjs/common';
import { AuhtController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuhtController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
