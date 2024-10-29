import {
  IsAlphanumeric,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsUUID,
  Length,
} from 'class-validator';
import { CreateAddressDto } from './address.dto';

export class UpdateEventDto {
  @IsUUID()
  id: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  @Length(1, 100)
  eventName: string;

  @IsDateString()
  startDateTime: string;

  @IsDateString()
  endDateTime: string;

  @IsAlphanumeric()
  description: string;

  @IsNotEmpty()
  eventAddress: CreateAddressDto;

  @IsBoolean()
  published: boolean;
}
