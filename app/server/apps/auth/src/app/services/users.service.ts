import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dto/create-user.dt';
import { UsersRepository } from '../repository/users.repository';
import { GetUserDto } from '../dto/get-user.dto';
import { AddressUserService } from './address-user.service';
import { GenericAddressDto } from '../dto/create-address.dto';
import { User } from '@app/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly addressService: AddressUserService
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.validateCreateUserDto(createUserDto);
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

  async updateUserAddress(user: User, userAddress: GenericAddressDto) {
    const address = await this.addressService.createAddress(userAddress);
    const userFromDb = await this.usersRepository.findOneById(user.id);
    userFromDb.userAddress = address;
    return await this.usersRepository.save(userFromDb);
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
    return this.usersRepository.findOneById(getUserDto.id);
  }
}
