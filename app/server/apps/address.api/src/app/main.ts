import { NestFactory } from '@nestjs/core';
import { AddressApiModule } from './modules/address.api.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { HTTP_PORT } from './constants/config.constants';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AddressApiModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  await app.listen(configService.get(HTTP_PORT)!);
}
bootstrap();
