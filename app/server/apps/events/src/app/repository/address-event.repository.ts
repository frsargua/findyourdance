import { EventAddress, BaseAbstractRepostitory } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AddressEventRepository extends BaseAbstractRepostitory<EventAddress> {
  protected logger: Logger = new Logger(AddressEventRepository.name);
  constructor(
    @InjectRepository(EventAddress)
    private readonly addressEventRepository: Repository<EventAddress>
  ) {
    super(addressEventRepository);
  }
}
