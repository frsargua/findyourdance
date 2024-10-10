import { BaseAbstractRepository, EventReview } from '@app/common';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class EventReviewRepository extends BaseAbstractRepository<EventReview> {
  constructor(
    @InjectRepository(EventReview)
    protected logger: Logger,
    private readonly eventsReviewsRepository: Repository<EventReview>
  ) {
    super(logger, eventsReviewsRepository);
  }

  public async deleteAllEventReviewsByUserId(
    userId: string
  ): Promise<DeleteResult> {
    try {
      const deleteResults = await this.eventsReviewsRepository
        .createQueryBuilder()
        .delete()
        .where('userId = :userId', { userId })
        .execute();

      this.logger.log(`Event reviews deleted for userId=${userId}`);
      return deleteResults;
    } catch (error) {
      this.logger.error(`Failed to delete event reviews for userId=${userId}`, {
        error,
      });
      throw new InternalServerErrorException('Failed to delete event reviews.');
    }
  }
}
