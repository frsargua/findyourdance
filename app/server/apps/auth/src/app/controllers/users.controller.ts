import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dt';
import { User } from '../model/users.entity';
import { CurrentUser } from '@app/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@CurrentUser() user: User) {
    return user;
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }
}
