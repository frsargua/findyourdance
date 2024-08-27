import {
  IsAlphanumeric,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { CreateAddressDto } from './address.dto';

export class CreateEventDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  @Length(1, 100)
  event_name: string;

  @IsDateString()
  start_date_time: string;

  @IsDateString()
  end_date_time: string;

  @IsAlphanumeric()
  description: string;

  @IsNotEmpty()
  eventAddress: CreateAddressDto;

  @IsBoolean()
  published: boolean = false;
}
