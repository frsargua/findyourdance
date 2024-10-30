import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Event } from './events.entity';
import { BaseImage } from './base-images.entity';

enum ImageType {
  MainImage = 'mainImage',
  Banner = 'banner',
  General = 'general',
}

@Entity()
@Index(['event'])
export class EventsImages extends BaseImage {
  @Column({
    type: 'enum',
    default: ImageType.General,
    enum: ImageType,
  })
  imageType: ImageType;

  @ManyToOne(() => Event, (event) => event.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  event: Event;
}
