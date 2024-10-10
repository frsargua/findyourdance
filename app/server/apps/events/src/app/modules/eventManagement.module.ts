import {
  TicketType,
  TicketPricingPhase,
  Event,
  AUTH_SERVICE,
  LoggerModule,
} from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRepository } from '../repository/events.repository';
import { TicketTypeRepository } from '../repository/ticket-type.repository';
import { TicketPricingPhaseRepository } from '../repository/ticket-pricing-phase.repository';
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
    EventRepository,
    TicketsService,
    TicketTypeRepository,
    TicketPhasesService,
    TicketPricingPhaseRepository,
  ],
  exports: [
    EventsService,
    EventRepository,
    TicketsService,
    TicketTypeRepository,
    TicketPhasesService,
    TicketPricingPhaseRepository,
    AddressModule,
    ImageModule,
    ClientsModule,
  ],
})
export class EventManagement {}
