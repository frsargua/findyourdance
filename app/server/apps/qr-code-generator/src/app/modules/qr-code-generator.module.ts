import { Module } from '@nestjs/common';
import { QrCodeGeneratorController } from '../controllers/qr-code-generator.controller';
import { QrCodeGeneratorService } from '../services/qr-code-generator.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { HTTP_PORT } from '../constants/config.constants';
import { LoggerModule } from '@app/common';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/qr-code-generator/.env',
      validationSchema: Joi.object({
        [HTTP_PORT]: Joi.number().required(),
      }),
    }),
  ],
  controllers: [QrCodeGeneratorController],
  providers: [QrCodeGeneratorService],
})
export class QrCodeGeneratorModule {}
