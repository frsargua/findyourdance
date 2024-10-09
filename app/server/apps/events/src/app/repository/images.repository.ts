import { BaseAbstractRepostitory, EventsImages } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ImagesRepository extends BaseAbstractRepostitory<EventsImages> {
  // protected logger: Logger = new Logger(ImagesRepository.name);
  constructor(
    @InjectRepository(EventsImages)
    private readonly imagesRepository: Repository<EventsImages>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    protected logger: Logger
  ) {
    super(logger, imagesRepository);
  }
}
