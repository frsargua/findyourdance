import { NestFactory } from '@nestjs/core';
import { AuthModule } from './modules/auth.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HTTP_PORT } from './constants/config.constants';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(configService.get(HTTP_PORT)!);
}
bootstrap();
