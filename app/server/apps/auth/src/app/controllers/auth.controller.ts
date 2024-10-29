import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CurrentUser, User } from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private logger: Logger
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) {
    const jwt = await this.authService.createSession(user, response);
    response.send(jwt);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: User
  ) {
    //TODO: Look into the option to use an guard to pass the user instead
    const result = await this.authService.revokeAuthToken(user, response);
    response.send(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('current/user')
  async getUser(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) {
    response.send(user);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  async authenticate(@CurrentUser() user: any, @Payload() data: any) {
    this.logger.debug(`Current user: ${JSON.stringify(data.user)}`);
    return user;
  }
}
