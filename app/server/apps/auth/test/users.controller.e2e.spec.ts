import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../src/app/controllers/users.controller';
import { UsersService } from '../src/app/services/users.service';
import { CreateUserDto } from '../src/app/dto/create-user.dt';
import { User } from '../src/app/model/users.entity';
import { randomUUID } from 'crypto';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

describe('UsersController Tests', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    verifyUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', async () => {
    return expect(controller).toBeDefined();
  });

  it('create => should create a new user by a given data', async () => {
    // arrange
    const createUserDto: CreateUserDto = {
      email: 'test@email.com',
      password: 'password',
    };

    const user = {
      id: randomUUID(),
      email: 'test@email.com',
      password: 'password',
      updatedAt: new Date(),
      createdAt: new Date(),
    } as User;

    jest.spyOn(mockUsersService, 'create').mockReturnValue(user);

    const result = await controller.createUser(createUserDto);

    expect(mockUsersService.create).toHaveBeenCalled();
    expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);

    expect(result).toEqual(user);
  });
});

describe('CreateUserDto input validation', () => {
  let validationPipe: ValidationPipe;

  beforeEach(async () => {
    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // transform: true,
    });
  });
  it('should validate with correct email and strong password', async () => {
    const createUserDto = new CreateUserDto();
    createUserDto.email = 'valid@email.com';
    createUserDto.password = 'StrongPassword123!';

    await expect(
      validationPipe.transform(createUserDto, {
        type: 'body',
        metatype: CreateUserDto,
      })
    ).resolves.toBeDefined();
  });

  it('should fail validation with invalid email', async () => {
    const createUserDto = new CreateUserDto();
    createUserDto.email = 'invalid-email';
    createUserDto.password = 'StrongPassword123!';

    await expect(
      validationPipe.transform(createUserDto, {
        type: 'body',
        metatype: CreateUserDto,
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('should fail validation with weak password', async () => {
    const createUserDto = new CreateUserDto();
    createUserDto.email = 'valid@email.com';
    createUserDto.password = 'weak';

    await expect(
      validationPipe.transform(createUserDto, {
        type: 'body',
        metatype: CreateUserDto,
      })
    ).rejects.toThrow(BadRequestException);
  });
});
