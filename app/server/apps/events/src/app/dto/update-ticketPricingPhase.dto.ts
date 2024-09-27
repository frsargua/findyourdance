import { TicketCategoryEnum } from '@app/common';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsDate,
  IsNumber,
  Min,
  IsEnum,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class UpdateTicketPricingPhaseDto {
  @IsOptional()
  @IsString()
  id?: string; // Include this if you want to allow updating specific phases

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveDate?: Date;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(TicketCategoryEnum)
  phaseCategory?: TicketCategoryEnum;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.phaseCategory === TicketCategoryEnum.CUSTOM)
  @IsNotEmpty({ message: 'Phase name is required for custom pricing strategy' })
  customPhaseName?: string;
}
