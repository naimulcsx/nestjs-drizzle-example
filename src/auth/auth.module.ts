import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { AuthController } from './controllers/auth.controller';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { HashingService } from './providers/hashing.service';
import { BcryptService } from './providers/bcrypt.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_TOKEN_TTL'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    { provide: HashingService, useClass: BcryptService },
    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
