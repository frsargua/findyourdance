import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventRepository } from '../repository/events.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { User } from '@app/common';
import { AddressEventService } from './address-event.service';
import { IdParamDto } from '../dto/uuid-param.dto.ts';
import { SearchEventsDto } from '../dto/search-events.dto';
import { ImageService } from './image.service';
import { UpdateEventPublishedStatusDto } from '../dto/update-event-published-status.dto';
import { EnableEventOptionsDto } from '../dto/enable-event-optionsDto';
import { TicketsService } from './tickets.service';
import { Logger } from 'nestjs-pino';

interface UpdateSingleEventOptions {
  enableRelationship: boolean;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly ticketsService: TicketsService,
    private readonly imageService: ImageService,
    private readonly addressService: AddressEventService,
    private readonly logger: Logger
  ) {
    this.logger.log('EventsService initialized');
  }

  relationsMapping: Record<string, string> = {
    with_address: 'eventAddress',
    with_reviews: 'reviews',
    with_tickets: 'ticketTypes.pricingPhases',
  };

  async create(
    {
      eventAddress,
      ticketsRequired,
      ticketTypes,
      ...createEventDto
    }: CreateEventDto,
    user: any
  ) {
    this.logger.log('create: Attempting to create new event', {
      createEventDto,
      userId: user.id,
    });

    const address = await this.addressService.createAddress(eventAddress);
    this.logger.log('create: Address created/found for event', { address });

    const event = this.eventRepository.create({
      ...createEventDto,
      ticketsRequired,
      eventAddress: address,
      user: user.id,
    });

    this.logger.log('create: Saving event', { event });
    let savedEvent = await this.eventRepository.save(event);

    let ticketsCreate;
    if (ticketsRequired && ticketTypes.length == 1) {
      this.logger.log('create: Creating single ticket for event', {
        eventId: savedEvent.id,
      });
      ticketsCreate = await this.ticketsService.createSingleTicket(
        ticketTypes[0],
        savedEvent
      );
      event.ticketTypes =
        ticketsCreate?.length > 0 && ticketsCreate ? ticketsCreate : [];
    }

    this.logger.log('create: Saving event with tickets', {
      eventId: savedEvent.id,
    });

    savedEvent = await this.eventRepository.save(event);
    return savedEvent;
  }

  async uploadEventImages(files: Express.Multer.File[]) {
    this.logger.log('uploadEventImages: Processing image upload', {
      fileCount: files.length,
    });
    return await this.imageService.processImagesUpload(files);
  }

  async getSingleEvent(id: string, options?: EnableEventOptionsDto) {
    this.logger.log('getSingleEvent: Fetching event', { eventId: id, options });
    const relations = this.getRelationsFromOptions(options);

    const eventDb = await this.eventRepository.findOneById(id, relations);

    if (!eventDb) {
      this.logger.warn('getSingleEvent: Event not found', { eventId: id });
      throw new NotFoundException('Event not found');
    }

    return eventDb;
  }

  async getEventCheapestTicket(id: string, options?: EnableEventOptionsDto) {
    this.logger.log('getEventCheapestTicket: Fetching event', {
      eventId: id,
      options,
    });
    const relations = this.getRelationsFromOptions(options);
    const event = await this.eventRepository.findOneById(id, relations);
    const cheapest = await event?.getCurrentCheapestTicketPrice();
    return { price: cheapest };
  }

  async getUserEvents(user: User, options?: EnableEventOptionsDto) {
    this.logger.log('getUserEvents: Fetching events for user', {
      userId: user.id,
      options,
    });
    const relations = this.getRelationsFromOptions(options);
    const events = await this.eventRepository.findAll({
      where: { user: user.id },
      relations: relations,
    });
    this.logger.log('getUserEvents: Events fetched successfully', {
      userId: user.id,
      eventCount: events.length,
    });
    return events;
  }

  async getEventWithinCoordinates(searchEventsDto: SearchEventsDto) {
    this.logger.log('getEventWithinCoordinates: Searching for events', {
      searchCriteria: searchEventsDto,
    });
    const events =
      await this.eventRepository.findEventsWithinRadius(searchEventsDto);
    this.logger.log('getEventWithinCoordinates: Events found', {
      eventCount: events.length,
    });
    return events;
  }

  async updateSingleEvent(
    user: User,
    id: IdParamDto['id'],
    updateEventDto: UpdateEventDto,
    options?: UpdateSingleEventOptions
  ) {
    this.logger.log('updateSingleEvent: Attempting to update event', {
      eventId: id,
      userId: user.id,
      options,
    });

    const relations = options?.enableRelationship ? ['eventAddress'] : [];
    const eventToUpdate = await this.eventRepository.findOneById(id, relations);

    if (!eventToUpdate) {
      this.logger.warn('updateSingleEvent: Event not found', { eventId: id });
      throw new NotFoundException('Event not found');
    }

    await this.validateEventOwnership(eventToUpdate.id, user.id);

    const { eventAddress, ...updateProps } = updateEventDto;

    Object.assign(eventToUpdate, updateProps);

    if (
      eventAddress &&
      eventToUpdate.eventAddress.uniqueDeliveryPointRef !==
        eventAddress.uniqueDeliveryPointRef
    ) {
      this.logger.log('updateSingleEvent: Updating event address', {
        eventId: id,
      });

      const updatedAddress =
        await this.addressService.createAddress(eventAddress);
      eventToUpdate.eventAddress = updatedAddress;
    }

    this.logger.log('updateSingleEvent: Event updated successfully', {
      eventId: id,
    });

    return this.eventRepository.save(eventToUpdate);
  }

  async switchEventPublishedStatus(
    user: User,
    updateEventDto: UpdateEventPublishedStatusDto
  ) {
    const { published: updatingPublished, id } = updateEventDto;
    this.logger.log('updateSingleEvent: Event updated successfully', {
      eventId: id,
    });

    const eventToUpdate = await this.eventRepository.findOneById(id);

    if (!eventToUpdate) {
      this.logger.warn('switchEventPublishedStatus: Event not found', {
        eventId: id,
      });
      throw new NotFoundException('Event not found');
    }
    await this.validateEventOwnership(eventToUpdate.id, user.id);

    if (updatingPublished === eventToUpdate.published) {
      this.logger.warn(
        'switchEventPublishedStatus: No change in publish status',
        { eventId: id, status: updatingPublished }
      );

      return eventToUpdate;
    }

    eventToUpdate.published = updatingPublished;

    const updatedEvent = await this.eventRepository.save(eventToUpdate);
    this.logger.log(
      'switchEventPublishedStatus: Event status updated successfully',
      { eventId: id, newStatus: updatingPublished }
    );
    return updatedEvent;
  }

  async deleteSingleEvent(user: User, id: IdParamDto['id']) {
    this.logger.log('deleteSingleEvent: Attempting to delete event', {
      eventId: id,
      userId: user.id,
    });

    const eventToDelete = await this.eventRepository.findOneById(id);

    if (!eventToDelete) {
      this.logger.warn('deleteSingleEvent: Event not found', { eventId: id });
      throw new NotFoundException('Event not found');
    }
    await this.validateEventOwnership(eventToDelete.id, user.id);

    const result = await this.eventRepository.remove(eventToDelete);
    this.logger.log('deleteSingleEvent: Event deleted successfully', {
      eventId: id,
    });
    return result;
  }

  async deleteUserEvents(user: any) {
    this.logger.log(
      'deleteUserEvents: Attempting to delete all events for user',
      { userId: user.id }
    );

    const deletedResults = await this.eventRepository.deleteAllEventsByUserId(
      user.id
    );

    this.logger.log('deleteUserEvents: User events deleted', {
      userId: user.id,
      deletedCount: deletedResults.affected,
    });

    return deletedResults;
  }

  private async validateEventOwnership(eventId: string, userId: string) {
    this.logger.log('validateEventOwnership: Validating event ownership', {
      eventId,
      userId,
    });
    try {
      await this.eventRepository.findByCondition({
        where: {
          id: eventId,
          user: userId,
        },
      });
      this.logger.log('validateEventOwnership: Event ownership validated', {
        eventId,
        userId,
      });
    } catch (error) {
      this.logger.error('validateEventOwnership: Validation failed', {
        eventId,
        userId,
        error: error.message,
      });
      throw new ForbiddenException(
        'Not allowed to update event, not event owner'
      );
    }
  }

  private getRelationsFromOptions(options?: EnableEventOptionsDto): string[] {
    if (!options) return [];

    const result = Object.keys(this.relationsMapping)
      .filter((key) => options[key as keyof EnableEventOptionsDto])
      .map((key) => this.relationsMapping[key]);

    this.logger.log('getRelationsFromOptions: Relations resolved', {
      options,
      result,
    });

    return result;
  }
}
