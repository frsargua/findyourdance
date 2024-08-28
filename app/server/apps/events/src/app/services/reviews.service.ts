import { Injectable } from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { EventsReviewsRepository } from '../repository/event-reviews.repository';
import { EventsService } from './events.service';

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
}
