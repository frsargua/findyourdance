import { IsUUID } from 'class-validator';

export class UuidDTO {
  @IsUUID('4', { each: true })
  id: string;
}
