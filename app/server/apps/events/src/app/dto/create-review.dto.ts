import { Event } from '@app/common';
import {
  IsAlphanumeric,
  IsBoolean,
  IsNotEmpty,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsAlphanumeric()
  @Length(1, 200)
  comment: string;

  @IsNotEmpty()
  event: Event;

  @IsNotEmpty()
  @Min(0)
  @Max(5)
  rating: number;

  @IsBoolean()
  is_flagged: boolean = false;

  @IsBoolean()
  published: boolean = true;
}
