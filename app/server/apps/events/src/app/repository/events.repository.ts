import { BaseAbstractRepostitory, Event } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { SearchEventsDto } from '../dto/search-events.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class EventsRepository extends BaseAbstractRepostitory<Event> {
  // protected logger: Logger = new Logger(EventsRepository.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    protected logger: Logger
  ) {
    super(logger, eventsRepository);
  }

  public async deleteAllEventsByUserId(userId: string): Promise<DeleteResult> {
    const entity = await this.getEntity();
    const deleteResults = await entity
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .execute()
      .catch((error) => {
        this.logger.error(
          `Failed to delete entities for userId=${userId}`,
          error
        );
        throw new Error('Failed to delete entities.');
      });

    this.logger.log(`Entities deleted for userId=${userId}`);

    return deleteResults;
  }

  async findEventsWithinRadius(
    searchEventsDto: SearchEventsDto
  ): Promise<Event[]> {
    const {
      longitude,
      latitude,
      radius,
      start_date_time,
      end_date_time,
      max_price,
      min_price,
    } = searchEventsDto;

    const distance = radius * 1000;

    const entity = await this.getEntity();
    const query = entity
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.eventAddress', 'events')
      .where(
        `ST_DWithin(
        events.location::geography,
        ST_MakePoint(:longitude, :latitude)::geography,
        :distance
      )`,
        { longitude, latitude, distance }
      );

    if (start_date_time) {
      query.andWhere('event.start_date_time >= :start_date_time', {
        start_date_time,
      });
    }

    if (end_date_time) {
      query.andWhere('event.end_date_time <= :end_date_time', {
        end_date_time,
      });
    }

    if (typeof min_price !== 'undefined') {
      query.andWhere('event.price >= :min_price', { min_price });
    }

    if (typeof max_price !== 'undefined') {
      query.andWhere('event.price <= :max_price', { max_price });
    }

    const events = await query.getMany();
    return events;
  }
}
