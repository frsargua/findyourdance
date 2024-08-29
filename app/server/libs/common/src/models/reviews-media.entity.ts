import { Column, Entity, ManyToOne } from 'typeorm';
import { Event } from './events.entity';
import { BaseImages } from './base-images.entity';
import { EventReview } from './events-reviews.entity';

enum ImageType {
  MainImage = 'mainImage',
  Banner = 'banner',
  General = 'general',
}

@Entity()
export class ReviewMedia extends BaseImages {
  @Column({
    type: 'enum',
    default: ImageType.General,
    enum: ImageType,
  })
  imageType: ImageType;

  @ManyToOne(() => Event, (event) => event.images)
  review: EventReview;
}
