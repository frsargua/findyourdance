import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../repository/events.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { SearchEventDto } from '../dto/search-event.dto copy';
import { Event } from '@app/common';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async create(createEventDto: CreateEventDto) {
    const event = this.eventsRepository.create(createEventDto);
    return await this.eventsRepository.save(event);
  }

  async getSingleEvent(id: string) {
    return await this.eventsRepository.findOneById(id);
  }

  async updateSingleEvent(updateEventDto: UpdateEventDto) {
    const eventToUpdate = await this.eventsRepository.findOneById(
      updateEventDto.id
    );

    eventToUpdate.description = updateEventDto.description;
    eventToUpdate.end_date_time = updateEventDto.end_date_time;
    eventToUpdate.start_date_time = updateEventDto.start_date_time;
    eventToUpdate.event_name = updateEventDto.event_name;

    return await this.eventsRepository.save(eventToUpdate);
  }

  async deleteSingleEvent(id: string) {
    const eventToDelete = await this.eventsRepository.findOneById(id);
    return await this.eventsRepository.remove(eventToDelete);
  }

  async searchEvents(searchEventsDto: SearchEventDto): Promise<Event[]> {
    const { event_name, start_date_time, end_date_time } = searchEventsDto;

    return await this.eventsRepository.queryWithQueryBuilder((queryBuilder) => {
      if (event_name) {
        queryBuilder.andWhere('event.eventName LIKE :eventName', {
          eventName: `%${event_name}%`,
        });
      }

      if (start_date_time) {
        queryBuilder.andWhere('event.startDateTime >= :startingDate', {
          startingDate: start_date_time,
        });
      }

      if (end_date_time) {
        queryBuilder.andWhere('event.endDateTime <= :endDate', {
          endDate: end_date_time,
        });
      }
      return queryBuilder;
    });
  }
}
