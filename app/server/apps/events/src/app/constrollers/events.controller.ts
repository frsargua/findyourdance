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

@Controller()
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

  @Get(':id')
  getSingleEvent(@Param('id') id: string) {
    return this.eventsService.getSingleEvent(id);
  }

  @Put()
  async updateSingleEvent(@Body() createEventDto: UpdateEventDto) {
    return await this.eventsService.updateSingleEvent(createEventDto);
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
