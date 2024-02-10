import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class EnableAddressDto {
  @Transform(
    ({ value }) => (value === 'false' ? false : value === 'true' ? true : true),
    { toClassOnly: true }
  )
  @IsBoolean()
  @IsOptional()
  with_address: boolean = true;
}
