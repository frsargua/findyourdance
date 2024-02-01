import { Module } from '@nestjs/common';
import { AddressController } from '../controllers/address.controller';
import { AddressService } from '../services/address.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { HTTP_PORT } from '../constants/config.constants';
import { LoggerModule } from '@app/common';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/address/.env',
      validationSchema: Joi.object({
        [HTTP_PORT]: Joi.number().required(),
      }),
    }),
  ],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
