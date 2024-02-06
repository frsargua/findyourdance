import { Module } from '@nestjs/common';
import { EventsController } from '../constrollers/events.controller';
import { EventsService } from '../services/events.service';
import { DatabaseModule, Event } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { EventsRepository } from '../repository/events.repository';
import { ConfigModule } from '@nestjs/config';
import { HTTP_PORT } from '../constants/config.constants';
import { AddressModule } from './address-event.module';
import { AddressEventService } from '../services/address-event.service';

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
      }),
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, AddressEventService],
})
export class EventsModule {}
