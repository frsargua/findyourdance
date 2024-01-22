import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dto/create-user.dt';
import { UsersRepository } from '../repository/users.repository';
import { GetUserDto } from '../dto/get-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    await this.validateCreateUserDto(createUserDto);

    console.log('creating');

    const user = this.usersRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    });

    return this.usersRepository.save(user);
  }

  private async validateCreateUserDto(createUserDto: CreateUserDto) {
    try {
      await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch (err) {
      return;
    }
    throw new UnprocessableEntityException('Email already exits');
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return user;
  }

  async getUser(getUserDto: GetUserDto) {
    return this.usersRepository.findOneById({ where: { getUserDto } });
  }
}
