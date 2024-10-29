import { BaseAbstractRepository, EventsImages } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class EventImageRepository extends BaseAbstractRepository<EventsImages> {
  constructor(
    protected logger: Logger,
    @InjectRepository(EventsImages)
    private readonly eventImageRepository: Repository<EventsImages>,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {
    super(logger, eventImageRepository);
  }
}
