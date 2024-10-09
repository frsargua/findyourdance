import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { User } from '@app/common';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    protected logger: Logger
  ) {}

  async login(user: User, response: Response) {
    this.logger.log('login: Attempting to log in user', {
      userId: user.id,
    });

    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
    };

    const expires = new Date();

    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION')
    );

    try {
      const token = this.jwtService.sign(tokenPayload);
      this.logger.debug('login: JWT token generated successfully');

      response.cookie('Authentication', token, { httpOnly: true, expires });
      this.logger.log('login: Authentication cookie set', { expires });

      this.logger.log(
        `login: User, with id: ${user.id}, logged in successfully`,
        {
          userId: user.id,
        }
      );

      return token;
    } catch (error) {
      this.logger.error('login: Failed to generate JWT token', {
        context: { userId: user.id, expires },
        error: error.message,
        stack: error.stack,
      });
      throw new HttpException(
        'Failed to log out. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async logout(user: User, response: Response) {
    this.logger.log(`logout: Attempting to log out user , ${user.id},`);

    try {
      response.clearCookie('Authentication');

      this.logger.log(
        `logout: Authentication cookie cleared successfully for user, ${user.id},`
      );

      return { message: 'You have been logged out successfully.' };
    } catch (error) {
      this.logger.error('logout: Failed to clear authentication cookie', {
        context: { userId: user.id },
        error: error.message,
        stack: error.stack,
      });
      throw new HttpException(
        'Failed to log out. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
