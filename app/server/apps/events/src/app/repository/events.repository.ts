import { BaseAbstractRepostitory, Event } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EventsRepository extends BaseAbstractRepostitory<Event> {
  protected logger: Logger = new Logger(EventsRepository.name);
  constructor(
    @InjectRepository(Event) private readonly userRepository: Repository<Event>
  ) {
    super(userRepository);
  }
}
