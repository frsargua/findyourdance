import { Module } from '@nestjs/common';
import { EventsModule } from './events.module';
import { TicketsModule } from './tickets.module';

@Module({
  imports: [EventsModule, TicketsModule],
})
export class AppModule {}
