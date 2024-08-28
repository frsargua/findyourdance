import { Module } from '@nestjs/common';
import { EventsController } from '../constrollers/events.controller';
import { EventsService } from '../services/events.service';
import {
  AUTH_SERVICE,
  DatabaseModule,
  Event,
  EventReview,
  ReviewMedia,
} from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { EventsRepository } from '../repository/events.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HTTP_PORT } from '../constants/config.constants';
import { AddressModule } from './address-event.module';
import { AddressEventService } from '../services/address-event.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ImageModule } from './image.module';
import { ImageService } from '../services/image.service';
import { EventsReviewService } from '../services/reviews.service';
import { EventsReviewsRepository } from '../repository/event-reviews.repository';

@Module({
  imports: [
    DatabaseModule,
    AddressModule,
    ImageModule,
    TypeOrmModule.forFeature([Event, EventReview, ReviewMedia]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/events/.env',
      validationSchema: Joi.object({
        [HTTP_PORT]: Joi.number().required(),
        AUTH_HOST: Joi.string().required(),
        AUTH_PORT: Joi.number().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_HOST'),
            port: configService.get('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsReviewService,
    EventsReviewsRepository,
    ImageService,
    EventsRepository,
    AddressEventService,
  ],
})
export class EventsModule {}
