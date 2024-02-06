import { AddressEvent, BaseAbstractRepostitory } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AddressEventRepository extends BaseAbstractRepostitory<AddressEvent> {
  protected logger: Logger = new Logger(AddressEventRepository.name);
  constructor(
    @InjectRepository(AddressEvent)
    private readonly addressEventRepository: Repository<AddressEvent>
  ) {
    super(addressEventRepository);
  }
}
