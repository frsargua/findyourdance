import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EventsService } from '../services/events.service';
import { CurrentUser, JwtAuthGuard, User } from '@app/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { SearchEventsDto } from '../dto/search-events.dto';
import { IdParamDto } from '../dto/uuid-param.dto.ts';
import { EnableAddressDto } from '../dto/enableAddressDto';
import { UpdateEventPublishedStatusDto } from '../dto/update-event-published-status.dto';

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
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadEventImages(
    @UploadedFiles() files: Express.Multer.File[] // Inject the uploaded files
    // @Body() eventId: IdParamDto
  ) {
    await this.eventsService.uploadEventImages(files);
    // console.log(eventId);
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
  async findWithinCoordinates(@Query() searchEventsDto: SearchEventsDto) {
    return this.eventsService.getEventWithinCoordinates(searchEventsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateById(
    @Param('id') id: IdParamDto,
    @Query() query: EnableAddressDto,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User
  ) {
    return await this.eventsService.updateSingleEvent(
      user,
      id,
      updateEventDto,
      {
        enableRelationship: query.with_address,
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('/publish/event')
  async publishByID(
    @Body() updateEventDto: UpdateEventPublishedStatusDto,
    @CurrentUser() user: User
  ) {
    return await this.eventsService.switchEventPublishedStatus(
      user,
      updateEventDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('id')
  async deleteSingleEvent(
    @Param('id') id: IdParamDto,
    @CurrentUser() user: User
  ) {
    return await this.eventsService.deleteSingleEvent(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user/all')
  deleteAllByUser(@CurrentUser() user: User) {
    return this.eventsService.deleteUserEvents(user);
  }
}
