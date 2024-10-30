import { Entity, Index, ManyToOne } from 'typeorm';
import { BaseImage } from './base-images.entity';
import { EventReview } from './events-reviews.entity';

@Entity()
@Index(['review'])
export class ReviewMedia extends BaseImage {
  @ManyToOne(() => EventReview, (review) => review.media, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  review: EventReview;
}
