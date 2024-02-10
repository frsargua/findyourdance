import { Module } from '@nestjs/common';
import { EventsController } from '../constrollers/events.controller';
import { EventsService } from '../services/events.service';
import { AUTH_SERVICE, DatabaseModule, Event } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { EventsRepository } from '../repository/events.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HTTP_PORT } from '../constants/config.constants';
import { AddressModule } from './address-event.module';
import { AddressEventService } from '../services/address-event.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    DatabaseModule,
    AddressModule,
    TypeOrmModule.forFeature([Event]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/events/.env',
      validationSchema: Joi.object({
        [HTTP_PORT]: Joi.number().required(),
        AUTH_HOST: Joi.string().required(),
        AUTH_PORT: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_HOST'),
            port: configService.get('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, AddressEventService],
})
export class EventsModule {}
