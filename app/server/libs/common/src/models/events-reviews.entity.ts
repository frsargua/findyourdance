import { AbstractEntity, Event, ReviewMedia } from '@app/common';
import {
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

@Entity()
@Index(['event'])
export class EventReview extends AbstractEntity {
  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Comment is required.' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters.' })
  comment: string;

  @Column({ type: 'int', default: 1 })
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1.' })
  @Max(5, { message: 'Rating must not exceed 5.' })
  rating: number;

  @ManyToOne(() => Event, (event) => event.reviews, { onDelete: 'CASCADE' })
  event: Event;

  @Column({ type: 'uuid' })
  @IsNotEmpty({ message: 'Reviewer is required.' })
  @IsUUID('4', { message: 'Reviewer must be a valid UUID.' })
  reviewer: string;

  @Column({ type: 'int', default: 0 })
  @IsInt()
  @Min(0, { message: 'Helpful count cannot be negative.' })
  helpfulCount: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isFlagged: boolean;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  published: boolean;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @MaxLength(2000, { message: 'Response must not exceed 2000 characters.' })
  response?: string;

  @OneToMany(() => ReviewMedia, (media) => media.review, {
    cascade: true,
  })
  media: ReviewMedia[];
}
