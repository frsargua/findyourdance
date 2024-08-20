import { Module } from '@nestjs/common';
import { ImageService } from '../services/image.service';
import { DatabaseModule, EventsImages, LoggerModule } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesRepository } from '../repository/images.repository';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    TypeOrmModule.forFeature([EventsImages]),
  ],
  providers: [ImageService, ImagesRepository],
  exports: [ImageService, ImagesRepository],
})
export class ImageModule {}
