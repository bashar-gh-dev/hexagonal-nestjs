import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationUseCase } from './application/use-cases/AuthenticationUseCase';
import { AuthenticationInputPort } from './application/ports/input/AuthenticationInputPort';
import { AuthenticationController } from './framework/input/http/authentication.controller';
import { HashingOutputPort } from './application/ports/output/HashingOutputPort';
import { RefreshTokenOutputPort } from './application/ports/output/RefreshTokenOutputPort';
import { JwtOutputPort } from './application/ports/output/JwtOutputPort';
import { HashingBcryptAdapter } from './framework/output/HashingBcryptAdapter';
import { RefreshTokenInMemoryAdapter } from './framework/output/RefreshTokenInMemoryAdapter';
import { JwtNestJsAdapter } from './framework/output/JwtNestJsAdapter';
import { jwtConfig } from '../config/jwt/jwt.config';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UsersModule, // which exports UserRepositoryOutputPort
  ],
  providers: [
    { provide: AuthenticationUseCase, useClass: AuthenticationInputPort },
    {
      provide: HashingOutputPort,
      useClass: HashingBcryptAdapter,
    },
    {
      provide: RefreshTokenOutputPort,
      useClass: RefreshTokenInMemoryAdapter,
    },
    { provide: JwtOutputPort, useClass: JwtNestJsAdapter },
  ],
  controllers: [AuthenticationController],
})
export class AuthModule {}
