import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Put,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TicketsService } from '../services/tickets.service';
import { JwtAuthGuard } from '@app/common';
import { EventOwnerGuard } from '../guards/event-owner.guard';
import { CreateTicketTypeDto } from '../dto/create-ticketType.dto';
import { UpdateTicketTypeDto } from '../dto/update-ticketType.dto';
import { ToggleActiveStatusDto } from '../dto/update-ticketType-activeStatus.dto';

@Controller('events/:eventId/tickets')
@UseGuards(JwtAuthGuard, EventOwnerGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketsService) {}

  @Get()
  async listTickets(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.ticketService.getAllEventTickets(eventId);
  }

  @Get(':ticketId')
  async getTicketById(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.ticketService.getEventTicketById(ticketId);
  }

  @Post()
  async createTicket(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() createTicketDto: CreateTicketTypeDto
  ) {
    return this.ticketService.createTicket(createTicketDto, eventId);
  }

  @Put(':ticketId')
  async updateTicket(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() updateTicketDto: UpdateTicketTypeDto
  ) {
    return this.ticketService.updateEventTicket(ticketId, updateTicketDto);
  }

  @Put(':ticketId/toggle-status')
  async toggleActiveStatus(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() { status: newActiveStatus }: ToggleActiveStatusDto
  ) {
    return this.ticketService.toggleActiveStatus(ticketId, newActiveStatus);
  }

  @Delete(':ticketId')
  async deleteTicket(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.ticketService.deleteEventTicket(ticketId);
  }
}
