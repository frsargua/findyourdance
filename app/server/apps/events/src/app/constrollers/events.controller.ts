import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { SearchEventDto } from '../dto/search-event.dto copy';
import { CurrentUser, JwtAuthGuard } from '@app/common';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: any
  ) {
    return await this.eventsService.create(createEventDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserEvents(@CurrentUser() user: any) {
    return await this.eventsService.getUserEvents(user, {
      enableRelationship: true,
    });
  }

  @Get(':id/with-address')
  async getEventWithAddress(@Param('id') id: string) {
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

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteAllEvents(@CurrentUser() user: any) {
    return this.eventsService.deleteUserEvents(user);
  }

  @Get('search')
  async search(@Body() searchOptions: SearchEventDto) {
    return await this.eventsService.searchEvents(searchOptions);
  }
}
