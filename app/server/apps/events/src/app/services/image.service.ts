import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { ImagesRepository } from '../repository/images.repository';
import { CreateEventImageDto } from '../dto/create-image.dto';

@Injectable()
export class ImageService {
  private s3;
  private bucketName = 'testing-s3-with-nestjs';

  constructor(
    private readonly configService: ConfigService,
    private readonly imagesRepository: ImagesRepository
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async create(createEventImageDto: CreateEventImageDto) {
    const image = await this.imagesRepository.create(createEventImageDto);
    return await this.imagesRepository.save(image);
  }

  async processImagesUpload(
    files: Array<{ buffer: any; mimetype: string; originalname: string }>
  ) {
    const uploadPromises = files.map((file) => this.uploadFile(file));

    try {
      const results = await Promise.all(uploadPromises);
      // console.log('All files have been uploaded successfully:', results);
      return results;
    } catch (error) {
      // console.error('Error uploading files:', error);
      throw error;
    }
  }

  async uploadFile(file: { buffer?: any; mimetype?: any; originalname?: any }) {
    const { originalname } = file;

    return await this.s3_upload(
      file.buffer,
      this.bucketName,
      originalname,
      file.mimetype
    );
  }

  async s3_upload(file: any, bucket: string, name: string, mimetype: any) {
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
      const s3Response = await this.s3.upload(params).promise();
      return s3Response;
    } catch (e) {
      throw new Error(e);
    }
  }
}
