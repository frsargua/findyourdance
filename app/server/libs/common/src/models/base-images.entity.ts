import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../database';
import { Event } from './events.entity';

enum ImageType {
  MainImage = 'mainImage',
  Banner = 'banner',
  General = 'general',
}

@Entity()
export class BaseImages extends AbstractEntity {
  @Column({ nullable: true })
  originalUrl: string;

  @Column({ nullable: true })
  lowResolutionPath: string;

  @Column({ nullable: true })
  mediumResolutionPath: string;

  @Column({ nullable: true })
  highResolutionPath: string;

  @Column({
    type: 'enum',
    default: ImageType.General,
    enum: ImageType,
  })
  imageType: ImageType;

  @ManyToOne(() => Event, (event) => event.images)
  event: Event;
}
