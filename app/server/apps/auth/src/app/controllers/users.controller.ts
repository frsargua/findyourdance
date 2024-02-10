import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dt';
import { CurrentUser, User } from '@app/common';
import { GenericAddressDto } from '../dto/create-address.dto';

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

  @Put('/update/address')
  @UseGuards(JwtAuthGuard)
  async updateUserAddress(
    @CurrentUser() user: User,
    @Body('address') userAddress: GenericAddressDto
  ) {
    return await this.usersService.updateUserAddress(user, userAddress);
  }
}
