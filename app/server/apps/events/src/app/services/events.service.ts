import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventsRepository } from '../repository/events.repository';
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

interface UpdateSingleEventOptions {
  enableRelationship: boolean;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly ticketsService: TicketsService,
    private readonly imageService: ImageService,
    private readonly addressService: AddressEventService
  ) {}

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
    const address = await this.addressService.createAddress(eventAddress);
    const event = this.eventsRepository.create({
      ...createEventDto,
      eventAddress: address,
      user: user.id,
    });

    let savedEvent = await this.eventsRepository.save(event);

    let ticketsCreate;
    if (ticketsRequired && ticketTypes.length == 1) {
      // console.log('Evento: ' + JSON.stringify(event));
      ticketsCreate = await this.ticketsService.createSingleTicket(
        ticketTypes[0],
        savedEvent
      );
      event.ticketTypes =
        ticketsCreate?.length > 0 && ticketsCreate ? ticketsCreate : [];
    }

    savedEvent = await this.eventsRepository.save(event);
    return savedEvent;
  }

  async uploadEventImages(files: Express.Multer.File[]) {
    const images = await this.imageService.processImagesUpload(files);
    return images;
  }

  async getSingleEvent(id: string, options?: EnableEventOptionsDto) {
    const relations = this.getRelationsFromOptions(options);

    return await this.eventsRepository.findOneById(id, relations);
  }

  async getUserEvents(user: User, options?: EnableEventOptionsDto) {
    const relations = this.getRelationsFromOptions(options);

    return await this.eventsRepository.findAll({
      where: { user: user.id },
      relations: relations,
    });
  }

  async getEventWithinCoordinates(searchEventsDto: SearchEventsDto) {
    const events =
      await this.eventsRepository.findEventsWithinRadius(searchEventsDto);
    return events;
  }

  async updateSingleEvent(
    user: User,
    id: IdParamDto,
    updateEventDto: UpdateEventDto,
    options?: UpdateSingleEventOptions
  ) {
    const relations = options?.enableRelationship ? ['eventAddress'] : [];
    const eventToUpdate = await this.eventsRepository.findOneById(
      id,
      relations
    );

    if (!eventToUpdate) throw new Error('Event not found');

    await this.validateEventOwnership(eventToUpdate.id, user.id);

    const { eventAddress, ...updateProps } = updateEventDto;

    Object.assign(eventToUpdate, updateProps);

    if (
      eventAddress &&
      eventToUpdate.eventAddress.uniqueDeliveryPointRef !==
        eventAddress.uniqueDeliveryPointRef
    ) {
      const updatedAddress =
        await this.addressService.createAddress(eventAddress);
      eventToUpdate.eventAddress = updatedAddress;
    }

    return this.eventsRepository.save(eventToUpdate);
  }

  async switchEventPublishedStatus(
    user: User,
    updateEventDto: UpdateEventPublishedStatusDto
  ) {
    const { published: updatingPublished, id } = updateEventDto;

    const eventToUpdate = await this.eventsRepository.findOneById(id);

    if (!eventToUpdate) throw new NotFoundException('Event not found');

    await this.validateEventOwnership(eventToUpdate.id, user.id);

    if (updatingPublished === eventToUpdate.published) {
      console.error(`The publish status is already: ${updatingPublished}`);
      return eventToUpdate;
    }

    eventToUpdate.published = updatingPublished;

    return await this.eventsRepository.save(eventToUpdate);
  }

  async deleteSingleEvent(user: User, id: IdParamDto) {
    const eventToDelete = await this.eventsRepository.findOneById(id);

    if (!eventToDelete) throw new Error('Event not found');

    await this.validateEventOwnership(eventToDelete.id, user.id);

    return await this.eventsRepository.remove(eventToDelete);
  }

  async deleteUserEvents(user: any) {
    const deletedResults = await this.eventsRepository.deleteAllEventsByUserId(
      user.id
    );

    return deletedResults;
  }

  private async validateEventOwnership(eventId: string, userId: string) {
    try {
      await this.eventsRepository.findByCondition({
        where: {
          id: eventId,
          user: userId,
        },
      });
    } catch (error) {
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

    console.log(result);

    return result;
  }
}
