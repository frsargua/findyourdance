import { BaseAbstractRepostitory, User } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository extends BaseAbstractRepostitory<User> {
  // protected logger: Logger = new Logger(UsersRepository.name);
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    protected logger: Logger
  ) {
    super(logger, userRepository);
  }
}
