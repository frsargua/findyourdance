import { Module } from '@nestjs/common';
import {
  DatabaseModule,
  Event,
  TicketPricingPhase,
  TicketType,
} from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@app/common';
import { TicketPhasesService } from '../services/ticketsPhases.service';
import { TicketsService } from '../services/tickets.service';
import { TicketsPhasesRepository } from '../repository/ticketsPhases.repository';
import { TicketsRepository } from '../repository/tickets.repository';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    TypeOrmModule.forFeature([Event, TicketType, TicketPricingPhase]),
  ],

  providers: [
    TicketsService,
    TicketsRepository,
    TicketPhasesService,
    TicketsPhasesRepository,
  ],

  exports: [
    TicketsService,
    TicketsRepository,
    TicketPhasesService,
    TicketsPhasesRepository,
  ],
})
export class TicketsModule {}
