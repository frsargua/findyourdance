import { NestFactory } from '@nestjs/core';
import { EventsModule } from './app/modules/events.module';
import { Logger } from 'nestjs-pino';
import { HTTP_PORT } from './app/constants/config.constants';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(EventsModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  await app.listen(configService.get(HTTP_PORT)!);
}
bootstrap();
