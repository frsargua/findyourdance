import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class EnableEventOptionsDto {
  @Transform(
    ({ obj }) => {
      const value = obj.with_address;
      return value === 'false' ? false : value === 'true' ? true : true;
    },
    { toClassOnly: true }
  )
  @IsBoolean()
  @IsOptional()
  with_address: boolean = true;

  @Transform(
    ({ obj }) => {
      const value = obj.with_reviews;
      return value === 'false' ? false : value === 'true' ? true : true;
    },
    { toClassOnly: true }
  )
  @IsBoolean()
  @IsOptional()
  with_reviews: boolean;

  @Transform(
    ({ obj }) => {
      const value = obj.with_tickets;
      return value === 'false' ? false : value === 'true' ? true : true;
    },
    { toClassOnly: true }
  )
  @IsBoolean()
  @IsOptional()
  with_tickets: boolean;
}
