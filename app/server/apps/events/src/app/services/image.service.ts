import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { ImagesRepository } from '../repository/images.repository';
import { CreateEventImageDto } from '../dto/create-image.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class ImageService {
  private s3Client: AWS.S3;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly imagesRepository: ImagesRepository,
    private readonly logger: Logger
  ) {
    const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
    if (!bucketName) {
      this.logger.error('Missing AWS_BUCKET_NAME configuration');
      throw new InternalServerErrorException(
        'AWS_BUCKET_NAME is not configured'
      );
    }
    this.bucketName = bucketName;

    this.initializeS3Client();
  }

  private initializeS3Client() {
    const region = this.configService.get('AWS_REGION');

    if (!this.bucketName || !region) {
      this.logger.warn('Missing S3 configuration', {
        bucketName: this.bucketName,
        region,
      });
      throw new InternalServerErrorException('Incomplete S3 configuration');
    }

    //TODO: Apparently it is better to use IAM roles instead of passing credentials directly
    this.s3Client = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });

    this.logger.log('ImageService: S3 client initialized');
  }

  async create(createEventImageDto: CreateEventImageDto) {
    this.logger.log('create: Creating new image', { dto: createEventImageDto });

    const image = await this.imagesRepository.create(createEventImageDto);

    const savedImage = await this.imagesRepository.save(image);

    this.logger.log('create: Image saved successfully', {
      imageId: savedImage.id,
    });

    return savedImage;
  }

  async processImagesUpload(
    files: Array<{ buffer: any; mimetype: string; originalname: string }>
  ) {
    this.logger.log('processImagesUpload: Starting upload process', {
      fileCount: files.length,
    });

    const uploadPromises = files.map((file) => this.uploadFile(file));

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results.filter(
        (result) => result.status === 'fulfilled'
      );
      const failedUploads = results.filter(
        (result) => result.status === 'rejected'
      );

      this.logger.log('processImagesUpload: Upload process completed', {
        totalFiles: files.length,
        successfulUploads: successfulUploads.length,
        failedUploads: failedUploads.length,
      });

      if (failedUploads.length > 0) {
        this.logger.warn('processImagesUpload: Some files failed to upload', {
          failedCount: failedUploads.length,
          errors: failedUploads.map((result: any) => result.reason.message),
        });
      }
      return successfulUploads;
    } catch (error) {
      this.logger.error('processImagesUpload: Error uploading files', {
        error: error.message,
      });

      throw new InternalServerErrorException('Failed to process image uploads');
    }
  }

  async uploadFile(file: { buffer?: any; mimetype?: any; originalname?: any }) {
    const { originalname } = file;
    this.logger.log('uploadFile: Uploading file to S3', {
      filename: originalname,
    });
    try {
      return await this.s3_upload(
        file.buffer,
        this.bucketName,
        originalname,
        file.mimetype
      );
    } catch (error) {
      this.logger.error('uploadFile: Failed to upload file', {
        filename: originalname,
        error: error.message,
      });
      throw new Error(
        `Failed to upload file ${originalname}: ${error.message}`
      );
    }
  }

  async s3_upload(file: any, bucket: string, name: string, mimetype: any) {
    this.logger.log('s3_upload: Preparing S3 upload', {
      bucket,
      filename: name,
      mimetype,
    });

    const params = {
      Bucket: bucket,
      Key: `images/original/${String(name)}`,
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-south-1',
      },
    };

    try {
      this.logger.log('s3_upload: Initiating S3 upload');

      const s3Response = await this.s3Client.upload(params).promise();

      this.logger.log('s3_upload: File uploaded successfully', {
        bucket: s3Response.Bucket,
        key: s3Response.Key,
        location: s3Response.Location,
      });
      return s3Response;
    } catch (error) {
      this.logger.error('s3_upload: Error uploading file to S3', {
        error: error.message,
        bucket,
        filename: name,
      });
      throw new InternalServerErrorException(
        `S3 upload failed for ${name}: ${error.message}`
      );
    }
  }
}
