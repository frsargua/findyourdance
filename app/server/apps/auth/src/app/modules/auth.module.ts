import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import {
  HTTP_PORT,
  JWT_EXPIRATION,
  JWT_SECRET,
  NODE_ENV,
  TCP_PORT,
} from '../constants/config.constants';
import { UsersModule } from './users.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStategy } from '../strategies/local.strategy';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { LoggerModule } from '@app/common';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env',
      validationSchema: Joi.object({
        [JWT_SECRET]: Joi.string().required(),
        [JWT_EXPIRATION]: Joi.string().required(),
        [HTTP_PORT]: Joi.number().required(),
        [TCP_PORT]: Joi.number().required(),
        [NODE_ENV]: Joi.boolean().required(),
      }),
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStategy, JwtStrategy],
})
export class AuthModule {}
