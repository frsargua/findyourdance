import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dto/create-user.dt';
import { UsersRepository } from '../repository/users.repository';
import { GetUserDto } from '../dto/get-user.dto';
import { AddressUserService } from './address-user.service';
import { GenericAddressDto } from '../dto/create-address.dto';
import { User } from '@app/common';
import { Logger } from 'nestjs-pino';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly addressService: AddressUserService,
    protected logger: Logger
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log('create: Attempting to create new user', {
      email: createUserDto.email,
    });

    await this.validateCreateUserDto(createUserDto);

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      this.logger.debug('create: Password hashed successfully');

      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await this.usersRepository.save(user);
      this.logger.log('create: User created successfully', {
        userId: savedUser.id,
      });
      return savedUser;
    } catch (error) {
      this.logger.error('create: Failed to create user', {
        email: createUserDto.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof ConflictException) {
        throw error; // Re-throw ConflictException
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the user'
      );
    }
  }

  private async validateCreateUserDto(createUserDto: CreateUserDto) {
    this.logger.debug(
      'validateCreateUserDto: Checking if email already exists',
      { email: createUserDto.email }
    );

    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      this.logger.warn('validateCreateUserDto: Email already exists', {
        email: createUserDto.email,
      });

      throw new ConflictException('Email already exists');
    }

    this.logger.debug('validateCreateUserDto: Email is unique');
  }

  async updateUserAddress(user: User, userAddress: GenericAddressDto) {
    this.logger.log('updateUserAddress: Attempting to update user address', {
      userId: user.id,
    });

    try {
      const address = await this.addressService.createAddress(userAddress);
      this.logger.debug(
        'updateUserAddress: Address created/fetched successfully'
      );

      const userFromDb = await this.usersRepository.findOneById(user.id);
      if (!userFromDb) {
        this.logger.warn('updateUserAddress: User not found', {
          userId: user.id,
        });
        throw new NotFoundException('User not found');
      }

      userFromDb.userAddress = address;
      const updatedUser = await this.usersRepository.save(userFromDb);
      this.logger.log('updateUserAddress: User address updated successfully', {
        userId: updatedUser.id,
      });

      return updatedUser;
    } catch (error) {
      this.logger.error('updateUserAddress: Failed to update user address', {
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the user address'
      );
    }
  }

  async verifyUser(email: string, password: string) {
    try {
      this.logger.log('verifyUser: Attempting to verify user', { email });

      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.warn('verifyUser: User not found', { email });
        throw new NotFoundException('User not found with credentials provided');
      }

      const passwordIsValid = await bcrypt.compare(password, user.password);

      if (!passwordIsValid) {
        this.logger.log('verifyUser: Attempting to verify user', { email });
        throw new UnauthorizedException('Credentials are not valid');
      }

      this.logger.log('verifyUser: User verified successfully', {
        userId: user.id,
      });
      return user;
    } catch (error) {
      this.logger.error('verifyUser: Failed to verify user', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // Re-throw these specific exceptions
      }
      throw new InternalServerErrorException(
        'An error occurred while verifying the user'
      );
    }
  }

  async getUser(getUserDto: GetUserDto) {
    this.logger.log('getUser: Attempting to fetch user', {
      userId: getUserDto.id,
    });

    const user = await this.usersRepository.findOneById(getUserDto.id);

    if (!user) {
      this.logger.warn('getUser: User not found', { userId: getUserDto.id });
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
