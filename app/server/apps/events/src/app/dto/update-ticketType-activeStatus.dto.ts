import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleActiveStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
