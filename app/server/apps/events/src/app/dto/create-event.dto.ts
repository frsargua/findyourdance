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
import { CreateTicketTypeDto } from './create-ticket.dto';
import { Type } from 'class-transformer';
import { TicketType } from '@app/common';

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

  @ValidateIf((o) => o.ticketsRequired === true)
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Tickets are required when ticketsRequired is true',
  })
  @ValidateNested({ each: true })
  @Type(() => TicketType)
  ticketTypes: CreateTicketTypeDto[] = [];

  @IsBoolean()
  ticketsRequired: boolean = false;

  @IsBoolean()
  ageRestriction: boolean;

  @IsBoolean()
  published: boolean = false;
}
