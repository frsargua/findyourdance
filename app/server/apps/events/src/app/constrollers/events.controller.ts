import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { SearchEventDto } from '../dto/search-event.dto copy';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(createEventDto);
  }

  // Add JWT auth to get user ID
  // @Get()
  // getUserEvents(): string {
  //   return this.eventsService.getHello();
  // }

  @Get(':id/with-address')
  getEventWithAddress(@Param('id') id: string) {
    return this.eventsService.getSingleEvent(id, { enableRelationship: true });
  }

  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.getSingleEvent(id);
  }

  @Put(':id')
  async updateSingleEvent(@Body() createEventDto: UpdateEventDto) {
    return await this.eventsService.updateSingleEvent(createEventDto, {
      enableRelationship: true,
    });
  }

  @Delete()
  async deleteSingleEvent(@Param('id') id: string) {
    return await this.eventsService.deleteSingleEvent(id);
  }

  // Add JWT auth to get user ID
  // @Delete()
  // deleteAllEvents(@Param('id') id: string): string {
  //   return this.eventsService.getHello(id);
  // }

  @Get('search')
  async search(@Body() searchOptions: SearchEventDto) {
    return await this.eventsService.searchEvents(searchOptions);
  }
}
