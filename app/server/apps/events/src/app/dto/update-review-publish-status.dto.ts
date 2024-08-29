import { IsBoolean, IsUUID } from 'class-validator';

export class UpdateReviewPublishStatusDto {
  @IsUUID()
  id: string;

  @IsBoolean()
  published: boolean = true;
}
