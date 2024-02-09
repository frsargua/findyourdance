import { BaseAbstractRepostitory, Event } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CoordinatesDto } from '../dto/coordinates.dto';

@Injectable()
export class EventsRepository extends BaseAbstractRepostitory<Event> {
  protected logger: Logger = new Logger(EventsRepository.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>
  ) {
    super(eventsRepository);
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
    coordinates: CoordinatesDto,
    distance: number
  ): Promise<Event[]> {
    const { longitude, latitude } = coordinates;

    const entity = await this.getEntity();
    const events = await entity
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.eventAddress', 'events')
      .where(
        `ST_DWithin(
        events.location::geography,
        ST_MakePoint(:longitude, :latitude)::geography,
        :distance
      )`,
        { longitude, latitude, distance }
      )
      .getMany();

    return events;
  }
}
