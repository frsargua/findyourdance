import { AddressApiController } from '../controllers/address.api.controller';
import { AddressApiService } from '../services/address.api.service';
import { LoggerModule } from '@app/common';
import * as Joi from 'joi';
import { HTTP_PORT } from '../constants/config.constants';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    LoggerModule,
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/address.api/.env',
      validationSchema: Joi.object({
        [HTTP_PORT]: Joi.number().required(),
        GET_ADDRESS_API: Joi.string().required(),
      }),
    }),
  ],
  controllers: [AddressApiController],
  providers: [AddressApiService],
})
export class AddressApiModule {}
