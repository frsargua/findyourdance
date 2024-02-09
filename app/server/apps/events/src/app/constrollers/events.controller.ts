import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { CurrentUser, JwtAuthGuard, User } from '@app/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { SearchEventDto } from '../dto/search-event.dto';
import { CoordinatesDto } from '../dto/coordinates.dto';
import { IdParamDto } from '../dto/uuid-param.dto.ts';
import { EnableAddressDto } from '../dto/enableAddressDto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User
  ) {
    return await this.eventsService.create(createEventDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/all')
  async findByUser(
    @CurrentUser() user: User,
    @Query() query: EnableAddressDto
  ) {
    return await this.eventsService.getUserEvents(user, {
      enableRelationship: query.with_address,
    });
  }

  @Get(':id')
  async findById(
    @Param() params: IdParamDto,
    @Query() query: EnableAddressDto
  ) {
    return this.eventsService.getSingleEvent(params.id, {
      enableRelationship: query.with_address,
    });
  }

  @Get('search/coordinates')
  async findWithinCoordinates(@Query() coordinates: CoordinatesDto) {
    return this.eventsService.getEventWithinCoordinates(coordinates);
  }

  @Put(':id')
  async updateById(
    @Param('id') id: IdParamDto,
    @Query() query: EnableAddressDto,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return await this.eventsService.updateSingleEvent(id, updateEventDto, {
      enableRelationship: query.with_address,
    });
  }

  @Delete('id')
  async deleteSingleEvent(@Param('id') id: IdParamDto) {
    return await this.eventsService.deleteSingleEvent(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user/all')
  deleteAllByUser(@CurrentUser() user: User) {
    return this.eventsService.deleteUserEvents(user);
  }

  @Post('search')
  async search(@Body() searchOptions: SearchEventDto) {
    return await this.eventsService.searchEvents(searchOptions);
  }
}
