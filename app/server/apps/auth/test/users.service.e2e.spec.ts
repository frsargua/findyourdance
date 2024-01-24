import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/app/services/users.service';
import { CreateUserDto } from '../src/app/dto/create-user.dt';
import { UsersRepository } from '../src/app/repository/users.repository';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { User } from '../src/app/model/users.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      save: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
    };

    jest.clearAllMocks(); // Reset all mocks

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('Create new user and return its data', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test12@email.com',
      password: 'password',
    };

    const hashedPassword = await bcrypt.hash('password', 10);
    const user: User = {
      id: randomUUID(),
      email: createUserDto.email,
      password: hashedPassword,
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(mockUserRepository, 'create').mockReturnValue(user);
    jest.spyOn(mockUserRepository, 'save').mockReturnValue(user);

    const result = await service.create(createUserDto);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: createUserDto.email },
    });
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });
});
