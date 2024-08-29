import { ForbiddenException, Injectable } from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { EventsReviewsRepository } from '../repository/event-reviews.repository';
import { EventsService } from './events.service';
import { User } from '@app/common';
import { UpdateReviewPublishStatusDto } from '../dto/update-review-publish-status.dto';
import { IdParamDto } from '../dto/uuid-param.dto.ts';

@Injectable()
export class EventsReviewService {
  constructor(
    private readonly reviewRepository: EventsReviewsRepository,
    private readonly imageService: ImageService,
    private readonly eventService: EventsService
  ) {}

  async create(createReviewDto: CreateReviewDto, user: any) {
    const { event: eventId, ...reviewData } = createReviewDto;

    // Ensure the event exists
    const event = await this.eventService.getSingleEvent(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const review = this.reviewRepository.create({
      ...reviewData,
      reviewer: user.id,
      event, // Associate the review with the event
    });

    return this.reviewRepository.save(review);
  }

  async getSingleEvent(reviewIdDto: IdParamDto, currentUser: User) {
    return await this.validateEventOwnership(reviewIdDto.id, currentUser.id);
  }

  async getUserEventsReviews(user: User) {
    return await this.reviewRepository.findAll({
      where: { reviewer: user.id },
    });
  }

  async switchEventReviewPublishedStatus(
    user: User,
    updateReviewDto: UpdateReviewPublishStatusDto
  ) {
    const { id: reviewNewId, published: reviewNewStatus } = updateReviewDto;

    const reviewToUpdate = await this.validateEventOwnership(
      reviewNewId,
      user.id
    );

    if (reviewToUpdate.published === reviewNewStatus) {
      console.error(`The publish status is already: ${reviewNewStatus}`);
      return reviewToUpdate;
    }

    reviewToUpdate.published = reviewNewStatus;

    return await this.reviewRepository.save(reviewToUpdate);
  }

  private async validateEventOwnership(reviewId: string, userId: string) {
    try {
      return await this.reviewRepository.findByCondition({
        where: {
          id: reviewId,
          reviewer: userId,
        },
      });
    } catch (error) {
      throw new ForbiddenException(
        'Not allowed to update event, not review owner'
      );
    }
  }
}
