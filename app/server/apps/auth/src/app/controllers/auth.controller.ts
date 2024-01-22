import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CurrentUser } from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { User } from '../model/users.entity';
import { Response } from 'express';

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
  @Post()
  async getUser(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) {
    response.send(user);
  }
}
