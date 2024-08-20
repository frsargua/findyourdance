import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3;
  private bucketName = 'your-bucket-name';

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  getUploadURL(fileName: string, contentType: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Expires: 60, // URL expiry time in seconds
      ContentType: contentType,
      ACL: 'public-read', // adjust the ACL according to your needs
    };

    return new Promise((resolve, reject) => {
      // S3 getSignedUrl with callbacks is not supported in AWS SDK for JavaScript (v3).
      // Please convert to 'client.getSignedUrl(apiName, options)', and re-run aws-sdk-js-codemod.
      this.s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }
}
