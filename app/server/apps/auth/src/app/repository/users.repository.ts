import { BaseAbstractRepostitory } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../model/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository extends BaseAbstractRepostitory<User> {
  protected logger: Logger = new Logger(UsersRepository.name);
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {
    super(userRepository);
  }
}
