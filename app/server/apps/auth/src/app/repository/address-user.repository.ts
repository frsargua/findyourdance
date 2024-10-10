import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';

import { AddressUser, BaseAbstractRepository } from '@app/common';

@Injectable()
export class AddressUserRepository extends BaseAbstractRepository<AddressUser> {
  constructor(
    protected readonly logger: Logger,
    @InjectRepository(AddressUser)
    private addressUserRepository: Repository<AddressUser>
  ) {
    super(logger, addressUserRepository);
  }
}
