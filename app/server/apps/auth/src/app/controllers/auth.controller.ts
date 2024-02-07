import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CurrentUser, User } from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) {
    const jwt = await this.authService.login(user, response);
    response.send(jwt);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    const result = await this.authService.logout(response);
    response.send(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async getUser(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) {
    response.send(user);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  async authenticate(@CurrentUser() user: any, @Payload() data: any) {
    console.log('Current user: ' + data.user);
    return user;
  }
}
