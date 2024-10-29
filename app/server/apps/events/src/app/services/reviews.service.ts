import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { EventReviewRepository } from '../repository/event-review.repository';
import { EventsService } from './events.service';
import { User } from '@app/common';
import { UpdateReviewPublishStatusDto } from '../dto/update-review-publish-status.dto';
import { IdParamDto } from '../dto/uuid-param.dto.ts';
import { Logger } from 'nestjs-pino';

@Injectable()
export class EventsReviewService {
  constructor(
    private readonly eventReviewRepository: EventReviewRepository,
    private readonly imageService: ImageService,
    private readonly eventService: EventsService,
    private readonly logger: Logger
  ) {
    this.logger.log('EventsReviewService initialized');
  }

  async create(createReviewDto: CreateReviewDto, user: any) {
    this.logger.log('create: Creating new review', {
      dto: createReviewDto,
      userId: user.id,
    });

    const { event: eventId, ...reviewData } = createReviewDto;

    const event = await this.eventService.getSingleEvent(eventId);

    if (!event) {
      this.logger.warn('create: Event not found', { eventId });
      throw new NotFoundException('Event not found');
    }

    const review = this.eventReviewRepository.create({
      ...reviewData,
      reviewer: user.id,
      event, // Associate the review with the event
    });

    try {
      const savedReview = await this.eventReviewRepository.save(review);

      this.logger.log('create: Review created successfully', {
        reviewId: savedReview.id,
      });

      return savedReview;
    } catch (error) {
      this.logger.error('create: Failed to save review', {
        error: error.message,
        dto: createReviewDto,
      });

      throw new InternalServerErrorException('Failed to create review');
    }
  }

  async getSingleEvent(reviewIdDto: IdParamDto, currentUser: User) {
    this.logger.log('getSingleEvent: Fetching single event review', {
      reviewId: reviewIdDto.id,
      userId: currentUser.id,
    });

    return await this.fetchAndValidateReviewOwnership(
      reviewIdDto.id,
      currentUser.id
    );
  }

  async getUserEventsReviews(user: User) {
    this.logger.log('getUserEventsReviews: Fetching user event reviews', {
      userId: user.id,
    });

    return await this.eventReviewRepository.findAll({
      where: { reviewer: user.id },
    });
  }

  async switchEventReviewPublishedStatus(
    user: User,
    updateReviewDto: UpdateReviewPublishStatusDto
  ) {
    const { id: reviewNewId, published: reviewNewStatus } = updateReviewDto;

    this.logger.log(
      'switchEventReviewPublishedStatus: Updating review published status',
      { reviewId: reviewNewId, newStatus: reviewNewStatus }
    );

    const reviewToUpdate = await this.fetchAndValidateReviewOwnership(
      reviewNewId,
      user.id
    );

    reviewToUpdate.published = reviewNewStatus;
    try {
      const updatedReview =
        await this.eventReviewRepository.save(reviewToUpdate);

      this.logger.log(
        'switchEventReviewPublishedStatus: Review status updated successfully',
        { reviewId: updatedReview.id, newStatus: updatedReview.published }
      );

      return updatedReview;
    } catch (error) {
      this.logger.error(
        'switchEventReviewPublishedStatus: Failed to update review status',
        { error: error.message, reviewId: reviewNewId }
      );

      throw new InternalServerErrorException('Failed to create review');
    }
  }

  private async fetchAndValidateReviewOwnership(
    reviewId: string,
    userId: string
  ) {
    this.logger.log('validateReviewOwnership: Validating review ownership', {
      reviewId,
      userId,
    });

    try {
      const review = await this.eventReviewRepository.findOne({
        where: {
          id: reviewId,
          reviewer: userId,
        },
      });

      if (!review) {
        this.logger.warn(
          'validateReviewOwnership: Review not found or user not authorized',
          { reviewId, userId }
        );

        throw new ForbiddenException(
          "User doesn't have credentials or review doesn't exist"
        );
      }

      return review;
    } catch (error) {
      this.logger.error(
        'validateReviewOwnership: Error validating review ownership',
        { error: error.message, reviewId, userId }
      );
      throw new InternalServerErrorException(
        'Error while validating review ownership'
      );
    }
  }
}
