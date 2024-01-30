import { Module } from '@nestjs/common';
import { EventsController } from '../constrollers/events.controller';
import { EventsService } from '../services/events.service';
import { DatabaseModule, Event } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsRepository } from '../repository/events.repository';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Event])],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
})
export class EventsModule {}
