import { BaseAbstractRepository, Event } from '@app/common';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { SearchEventsDto } from '../dto/search-events.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class EventRepository extends BaseAbstractRepository<Event> {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    protected logger: Logger
  ) {
    super(logger, eventRepository);
  }

  public async deleteAllEventsByUserId(userId: string): Promise<DeleteResult> {
    const entity = await this.getEntity();
    const deleteResults = await entity
      .createQueryBuilder()
      .delete()
      .where('user = :userId', { userId })
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
      startDateTime,
      endDateTime,
      max_price,
      min_price,
    } = searchEventsDto;

    const distance = radius * 1000; // Assuming radius is in kilometers

    try {
      const query = this.eventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.eventAddress', 'address')
        .where(
          `ST_DWithin(
            address.location::geography,
            ST_MakePoint(:longitude, :latitude)::geography,
            :distance
          )`,
          { longitude, latitude, distance }
        );

      if (startDateTime) {
        query.andWhere('event.start_date_time >= :startDateTime', {
          startDateTime,
        });
      }

      if (endDateTime) {
        query.andWhere('event.end_date_time <= :endDateTime', {
          endDateTime,
        });
      }

      if (min_price !== undefined) {
        query.andWhere('event.price >= :min_price', { min_price });
      }

      if (max_price !== undefined) {
        query.andWhere('event.price <= :max_price', { max_price });
      }

      const events = await query.getMany();
      return events;
    } catch (error) {
      this.logger.error('Failed to find events within radius', {
        error,
        searchParams: searchEventsDto,
      });
      throw new InternalServerErrorException('Failed to find events.');
    }
  }
}
