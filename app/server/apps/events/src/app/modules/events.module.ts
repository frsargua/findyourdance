import { Module } from '@nestjs/common';
import { EventsController } from '../constrollers/events.controller';
import { EventsService } from '../services/events.service';
import {
  AUTH_SERVICE,
  DatabaseModule,
  Event,
  EventReview,
  ReviewMedia,
  TicketPricingPhase,
  TicketType,
} from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { EventsRepository } from '../repository/events.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HTTP_PORT } from '../constants/config.constants';
import { AddressModule } from './address-event.module';
import { AddressEventService } from '../services/address-event.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ImageModule } from './image.module';
import { ImageService } from '../services/image.service';
import { EventsReviewService } from '../services/reviews.service';
import { EventsReviewsRepository } from '../repository/event-reviews.repository';
import { TicketPhasesService } from '../services/ticketsPhases.service';
import { TicketsService } from '../services/tickets.service';
import { TicketsPhasesRepository } from '../repository/ticketsPhases.repository';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketsModule } from './tickets.module';

@Module({
  imports: [
    DatabaseModule,
    AddressModule,
    ImageModule,
    TicketsModule,
    TypeOrmModule.forFeature([
      Event,
      TicketType,
      TicketPricingPhase,
      EventReview,
      ReviewMedia,
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/events/.env',
      validationSchema: Joi.object({
        [HTTP_PORT]: Joi.number().required(),
        AUTH_HOST: Joi.string().required(),
        AUTH_PORT: Joi.number().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
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
  providers: [
    EventsService,
    EventsReviewService,
    EventsReviewsRepository,
    ImageService,
    TicketsService,
    TicketsRepository,
    TicketPhasesService,
    TicketsPhasesRepository,
    EventsRepository,
    AddressEventService,
  ],
})
export class EventsModule {}
