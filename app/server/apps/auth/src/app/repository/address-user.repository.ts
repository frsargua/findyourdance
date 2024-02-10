import { AddressUser, BaseAbstractRepostitory } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AddressUsersRepository extends BaseAbstractRepostitory<AddressUser> {
  protected logger: Logger = new Logger(AddressUsersRepository.name);
  constructor(
    @InjectRepository(AddressUser)
    private readonly addressUserRepository: Repository<AddressUser>
  ) {
    super(addressUserRepository);
  }
}
