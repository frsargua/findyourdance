import {
  TicketType,
  TicketPricingPhase,
  Event,
  AUTH_SERVICE,
  LoggerModule,
} from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsRepository } from '../repository/events.repository';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketsPhasesRepository } from '../repository/ticketsPhases.repository';
import { EventsService } from '../services/events.service';
import { TicketsService } from '../services/tickets.service';
import { TicketPhasesService } from '../services/ticketsPhases.service';
import { AddressModule } from './address-event.module';
import { ImageModule } from './image.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AddressModule,
    ImageModule,
    LoggerModule,
    TypeOrmModule.forFeature([Event, TicketType, TicketPricingPhase]),
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
  providers: [
    EventsService,
    EventsRepository,
    TicketsService,
    TicketsRepository,
    TicketPhasesService,
    TicketsPhasesRepository,
  ],
  exports: [
    EventsService,
    EventsRepository,
    TicketsService,
    TicketsRepository,
    TicketPhasesService,
    TicketsPhasesRepository,
    AddressModule,
    ImageModule,
    ClientsModule,
  ],
})
export class EventManagement {}
