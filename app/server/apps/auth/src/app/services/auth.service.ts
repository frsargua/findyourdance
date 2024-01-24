import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { User } from '../model/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async login(user: User, response: Response) {
    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
    };

    const expires = new Date();

    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION')
    );

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, { httpOnly: true, expires });
    return token;
  }

  async logout(response: Response) {
    response.clearCookie('Authentication');
    return { message: 'You have been logged out successfully.' };
  }
}
