import { SalesStrategyEnum } from '@app/common';
import { Type } from 'class-transformer';
import {
  IsString,
  MaxLength,
  IsDate,
  IsInt,
  Min,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
  Max,
} from 'class-validator';
import { CreateTicketPricingPhaseDto } from './create-ticket-price-phase.dto';

export class CreateTicketTypeDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsDate()
  @Type(() => Date)
  saleStartDate: Date;

  @IsDate()
  @Type(() => Date)
  saleEndDate: Date;

  @IsInt()
  @Min(0)
  capacity: number;

  @IsEnum(SalesStrategyEnum)
  salesStrategy: SalesStrategyEnum;

  @IsBoolean()
  allowWaitList: boolean;

  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(0)
  @Type(() => CreateTicketPricingPhaseDto)
  pricingPhases: CreateTicketPricingPhaseDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  validForDays?: number;

  @IsBoolean()
  isActive: boolean;

  @IsInt()
  @Min(1)
  maxPerCustomer: number;
}
