import { Module } from '@nestjs/common';
import {
  DatabaseModule,
  Event,
  LoggerModule,
  TicketPricingPhase,
  TicketType,
} from '@app/common';
import { TicketController } from '../constrollers/ticket.controller';
import { EventManagement } from './eventManagement.module';
import { TicketsService } from '../services/tickets.service';
import { EventRepository } from '../repository/events.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    EventManagement,
    TypeOrmModule.forFeature([Event, TicketType, TicketPricingPhase]),
  ],
  controllers: [TicketController],
  providers: [TicketsService, EventRepository],
})
export class TicketsModule {}
