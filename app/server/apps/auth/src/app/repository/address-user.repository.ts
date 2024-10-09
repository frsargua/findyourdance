import { AddressUser, BaseAbstractRepostitory } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';

@Injectable()
export class AddressUsersRepository extends BaseAbstractRepostitory<AddressUser> {
  // protected logger: Logger = new Logger(AddressUsersRepository.name);
  constructor(
    @InjectRepository(AddressUser)
    private readonly addressUserRepository: Repository<AddressUser>,
    protected logger: Logger
  ) {
    super(logger, addressUserRepository);
  }
}
