import { IsOptional, IsString, IsEnum } from 'class-validator';

enum ImageType {
  MainImage = 'mainImage',
  Banner = 'banner',
  General = 'general',
}

export class CreateEventImageDto {
  @IsOptional()
  @IsString()
  originalUrl?: string;

  @IsOptional()
  @IsString()
  lowResolutionPath?: string;

  @IsOptional()
  @IsString()
  mediumResolutionPath?: string;

  @IsOptional()
  @IsString()
  highResolutionPath?: string;

  @IsEnum(ImageType)
  imageType: ImageType;

  @IsString()
  eventId: string;
}
