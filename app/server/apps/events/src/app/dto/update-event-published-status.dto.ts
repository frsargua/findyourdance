import { IsBoolean, IsUUID } from 'class-validator';

export class UpdateEventPublishedStatusDto {
  @IsUUID()
  id: string;

  @IsBoolean()
  published: boolean;
}
