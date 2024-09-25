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

@Controller('events/:eventId/tickets')
@UseGuards(JwtAuthGuard, EventOwnerGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketsService) {}

  @Get('/all')
  async listTickets(@Param('eventId') eventId: string) {
    return await this.ticketService.getAllEventTickets(eventId);
  }

  @Get(':ticketId')
  async getTicketById(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.ticketService.getEventTicketById(ticketId);
  }

  @Post('create')
  async createTicket(
    @Param('eventId') eventId: string,
    @Body() createTicketDto: CreateTicketTypeDto
  ) {
    return this.ticketService.createTicket(createTicketDto, eventId);
  }

  @Put('update/:ticketId')
  async updateTicket(
    @Param('ticketId') ticketId: string,
    @Body() updateTicketDto: UpdateTicketTypeDto
  ) {
    return this.ticketService.updateEventTicket(ticketId, updateTicketDto);
  }

  @Delete(':ticketId')
  async deleteTicket(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.ticketService.deleteEventTicket(ticketId);
  }
}
