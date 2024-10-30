import { Column } from 'typeorm';
import { AbstractEntity } from '../database';
import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

enum ImageFormat {
  JPG = 'JPG',
  PNG = 'PNG',
  WEBP = 'WEBP',
  HEIC = 'HEIC',
}

enum VideoFormat {
  MP4 = 'MP4',
}

export class BaseImage extends AbstractEntity {
  @Column({ nullable: true })
  @IsUrl({}, { message: 'URL path must be a valid URL.' })
  originalUrl: string;

  @Column({ nullable: true })
  @ValidateIf((o) => o.mediaType === MediaType.IMAGE)
  @IsUrl({}, { message: 'Low resolution path must be a valid URL.' })
  @ValidateIf((o) => o.mediaType === MediaType.VIDEO)
  @IsEmpty({ message: 'Low resolution path must be empty for videos.' })
  lowResolutionPath: string;

  @Column({ nullable: true })
  @ValidateIf((o) => o.mediaType === MediaType.IMAGE)
  @IsUrl({}, { message: 'Medium resolution path must be a valid URL.' })
  @ValidateIf((o) => o.mediaType === MediaType.VIDEO)
  @IsEmpty({ message: 'Medium resolution path must be empty for videos.' })
  mediumResolutionPath: string;

  @Column({ nullable: true })
  @ValidateIf((o) => o.mediaType === MediaType.IMAGE)
  @IsUrl({}, { message: 'High resolution path must be a valid URL.' })
  @ValidateIf((o) => o.mediaType === MediaType.VIDEO)
  @IsEmpty({ message: 'High resolution path must be empty for videos.' })
  highResolutionPath: string;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @Column({
    type: 'enum',
    enum: { ...ImageFormat, ...VideoFormat },
  })
  @ValidateIf((o) => o.mediaType === MediaType.IMAGE)
  @IsEnum(ImageFormat, { message: 'Invalid image format' })
  @ValidateIf((o) => o.mediaType === MediaType.VIDEO)
  @IsEnum(VideoFormat, { message: 'Invalid video format' })
  format: ImageFormat | VideoFormat;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Order must be a non-negative integer.' })
  displayOrder?: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  @IsBoolean()
  active: boolean;

  @Column()
  @IsOptional()
  @IsUUID('4', { message: 'Uploader must be a valid UUID.' })
  uploadedBy?: string;
}
