import { Module } from '@nestjs/common';
import { ImageService } from '../services/image.service';
import { DatabaseModule, EventsImages, LoggerModule } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventImageRepository } from '../repository/event-image.repository';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    TypeOrmModule.forFeature([EventsImages]),
  ],
  providers: [ImageService, EventImageRepository],
  exports: [ImageService, EventImageRepository],
})
export class ImageModule {}
