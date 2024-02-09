import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../repository/events.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { User } from '@app/common';
import { AddressEventService } from './address-event.service';
import { IdParamDto } from '../dto/uuid-param.dto.ts';
import { SearchEventsDto } from '../dto/search-events.dto';

interface GetSingleEventOptions {
  enableRelationship: boolean;
}
interface UpdateSingleEventOptions {
  enableRelationship: boolean;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly addressService: AddressEventService
  ) {}

  async create({ eventAddress, ...createEventDto }: CreateEventDto, user: any) {
    const address = await this.addressService.createAddress(eventAddress);
    const event = this.eventsRepository.create({
      ...createEventDto,
      eventAddress: address,
      user: user.id,
    });
    return await this.eventsRepository.save(event);
  }

  async getSingleEvent(id: string, options?: GetSingleEventOptions) {
    const relations = options?.enableRelationship ? ['eventAddress'] : [];
    return await this.eventsRepository.findOneById(id, relations);
  }

  async getUserEvents(user: User, options?: GetSingleEventOptions) {
    const relations = options?.enableRelationship ? ['eventAddress'] : [];

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
    id: IdParamDto,
    updateEventDto: UpdateEventDto,
    options?: UpdateSingleEventOptions
  ) {
    const { eventAddress, ...updateProps } = updateEventDto;
    const relations = options?.enableRelationship ? ['eventAddress'] : [];
    const eventToUpdate = await this.eventsRepository.findOneById(
      id,
      relations
    );

    if (!eventToUpdate) throw new Error('Event not found');

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

  async deleteSingleEvent(id: IdParamDto) {
    const eventToDelete = await this.eventsRepository.findOneById(id);
    return await this.eventsRepository.remove(eventToDelete);
  }

  async deleteUserEvents(user: any) {
    const deletedResults = await this.eventsRepository.deleteAllEventsByUserId(
      user.id
    );

    return deletedResults;
  }
}
