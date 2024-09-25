import {
  IsDate,
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  ValidateIf,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketCategoryEnum } from '@app/common';

export class CreateTicketPricingPhaseDto {
  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsEnum(TicketCategoryEnum)
  phaseCategory: TicketCategoryEnum;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.phaseCategory === TicketCategoryEnum.CUSTOM)
  @IsNotEmpty({ message: 'Phase name is required for custom pricing strategy' })
  customPhaseName?: string;
}
