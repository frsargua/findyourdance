import { AbstractEntity, Event, ReviewMedia } from '@app/common';
import { IsInt, Min, Max } from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class EventReview extends AbstractEntity {
  @Column('text')
  comment: string;

  @Column({ type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;

  @ManyToOne(() => Event, (event) => event.reviews, { onDelete: 'CASCADE' })
  event: Event;

  @Column()
  reviewer: string;

  @Column({ type: 'int', default: 0 })
  helpful_count: number;

  @Column({ type: 'boolean', default: false })
  is_flagged: boolean;

  //allow reviews to be hidden if they dont follow good practices
  @Column({ type: 'boolean', default: true })
  published: boolean;

  @Column({ type: 'text', nullable: true })
  response: string;

  @OneToMany(() => ReviewMedia, (media) => media.review, { cascade: true })
  media: ReviewMedia[];
}
