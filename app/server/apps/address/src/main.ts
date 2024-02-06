import { NestFactory } from '@nestjs/core';
import { AddressModule } from '../../address.api/src/app/modules/address.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { HTTP_PORT } from './app/constants/config.constants';

async function bootstrap() {
  const app = await NestFactory.create(AddressModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  await app.listen(configService.get(HTTP_PORT)!);
}
bootstrap();
