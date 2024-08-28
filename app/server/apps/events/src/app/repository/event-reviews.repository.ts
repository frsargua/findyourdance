import { BaseAbstractRepostitory, EventReview } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class EventsReviewsRepository extends BaseAbstractRepostitory<EventReview> {
  protected logger: Logger = new Logger(EventsReviewsRepository.name);
  constructor(
    @InjectRepository(EventReview)
    private readonly eventsReviewsRepository: Repository<EventReview>
  ) {
    super(eventsReviewsRepository);
  }

  public async deleteAllEventReviewsByUserId(
    userId: string
  ): Promise<DeleteResult> {
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
}
