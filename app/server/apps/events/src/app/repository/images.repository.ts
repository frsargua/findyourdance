import { BaseAbstractRepostitory, EventsImages } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ImagesRepository extends BaseAbstractRepostitory<EventsImages> {
  protected logger: Logger = new Logger(ImagesRepository.name);
  constructor(
    @InjectRepository(EventsImages)
    private readonly imagesRepository: Repository<EventsImages>,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {
    super(imagesRepository);
  }
}
