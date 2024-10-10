import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';

import { BaseAbstractRepository, User } from '@app/common';

@Injectable()
export class UserRepository extends BaseAbstractRepository<User> {
  constructor(
    protected readonly logger: Logger,
    @InjectRepository(User)
    userRepository: Repository<User>
  ) {
    super(logger, userRepository);
  }
}
