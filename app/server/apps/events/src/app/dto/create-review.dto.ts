import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @Length(1, 200)
  comment: string;

  @IsNotEmpty()
  event: string;

  @IsNotEmpty()
  @Min(0)
  @Max(5)
  rating: number;

  @IsBoolean()
  is_flagged: boolean = false;

  @IsBoolean()
  published: boolean = true;
}
