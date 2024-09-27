import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsDate,
  IsInt,
  Min,
  IsBoolean,
  ValidateNested,
  Max,
  IsArray,
} from 'class-validator';
import { CreateTicketPricingPhaseDto } from './create-ticketPricingPhase.dto';
import { UpdateTicketPricingPhaseDto } from './update-ticketPricingPhase.dto';
import { UuidDTO } from './iuuid.dto';

class PricingPhasesUpdateDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTicketPricingPhaseDto)
  update?: UpdateTicketPricingPhaseDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketPricingPhaseDto)
  create?: CreateTicketPricingPhaseDto[];

  @IsOptional()
  @IsArray()
  @Type(() => UuidDTO)
  delete?: UuidDTO[];
}

export class UpdateTicketTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  saleStartDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  saleEndDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  allowWaitList?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PricingPhasesUpdateDto)
  pricingPhases?: PricingPhasesUpdateDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  validForDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxPerCustomer?: number;
}
