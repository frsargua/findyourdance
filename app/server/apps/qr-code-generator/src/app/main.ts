import { NestFactory } from '@nestjs/core';
import { QrCodeGeneratorModule } from './modules/qr-code-generator.module';
import { ConfigService } from '@nestjs/config';
import { HTTP_PORT } from './constants/config.constants';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(QrCodeGeneratorModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  await app.listen(configService.get(HTTP_PORT)!);
}
bootstrap();
