import {
  IsAlphanumeric,
  IsDateString,
  IsNotEmpty,
  IsUUID,
  Length,
} from 'class-validator';

export class UpdateEventDto {
  @IsUUID()
  id: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  @Length(1, 100)
  event_name: string;

  @IsDateString()
  start_date_time: Date;

  @IsDateString()
  end_date_time: Date;

  @IsAlphanumeric()
  description: string;
}
