import {
  ArrayMinSize,
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  Length,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from './address.dto';
import { CreateTicketTypeDto } from './create-ticketType.dto';
import { Type } from 'class-transformer';

export class CreateEventDto {
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

  @ValidateIf((o) => o.ticketsRequired === true)
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Tickets are required when ticketsRequired is true',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateTicketTypeDto)
  ticketTypes: CreateTicketTypeDto[] = [];

  @IsBoolean()
  ticketsRequired: boolean;

  @IsBoolean()
  ageRestriction: boolean;

  @IsBoolean()
  published: boolean = false;
}
