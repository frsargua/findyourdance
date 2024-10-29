import { IsDate, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { CoordinatesDto } from './coordinates.dto';
import { IsFutureDate } from '@app/common/decorators/is-future-date.decorator.ts';

export class SearchEventsDto extends CoordinatesDto {
  @IsNumber()
  @IsOptional()
  radius: number = 1;

  @IsDate()
  // @IsFutureDate()
  @IsOptional()
  startDateTime: Date;

  @IsDate()
  @IsOptional()
  @IsFutureDate()
  endDateTime: Date;

  @IsNumber()
  @IsOptional()
  @Max(1000)
  @Min(0)
  max_price?: number;

  @IsNumber()
  @IsOptional()
  @Max(1000)
  @Min(0)
  min_price?: number;
}
