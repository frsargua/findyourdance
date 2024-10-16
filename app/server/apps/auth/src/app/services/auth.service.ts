import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { AUTH_COOKIE_NAME, User } from '@app/common';
import { Logger } from 'nestjs-pino';
import { JWT_EXPIRATION, NODE_ENV } from '../constants/config.constants';

@Injectable()
export class AuthService {
  private readonly AUTH_COOKIE_NAME: string;
  private isProduction: boolean;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private logger: Logger
  ) {
    this.AUTH_COOKIE_NAME = AUTH_COOKIE_NAME;
    this.isProduction =
      this.configService.get<string>(NODE_ENV) === 'production';
  }

  async createSession(
    user: User,
    response: Response
  ): Promise<{ message: string }> {
    if (!user || !user.id) {
      this.logger.error('createSession: Invalid user object provided');
      throw new BadRequestException('Invalid user data');
    }

    this.logger.log('createSession: Attempting to log in user', {
      userId: user.id,
    });

    const tokenPayload: TokenPayload = { userId: user.id.toString() };

    try {
      let jwtExpiration = this.configService.get<number>(JWT_EXPIRATION);

      if (!jwtExpiration) {
        jwtExpiration = jwtExpiration || 3600;
        this.logger.warn(
          'createSession: JWT_EXPIRATION not set, defaulting to 1h'
        );
      }
      const expires = new Date();

      expires.setSeconds(expires.getSeconds() + jwtExpiration);

      const token = await this.jwtService.signAsync(tokenPayload);
      this.logger.debug('createSession: JWT token generated successfully', {
        userId: user.id,
      });

      this.setAuthTokenCookie(response, token, expires);

      this.logger.log('createSession: User logged in successfully', {
        userId: user.id,
      });

      return { message: 'Login successful' };
    } catch (error) {
      this.logger.error('createSession: Failed to generate JWT token', {
        userId: user.id,
        error: error.message,
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        'Failed to log in. Please try again.',
        { cause: error }
      );
    }
  }

  async revokeAuthToken(
    user: User,
    response: Response
  ): Promise<{ message: string }> {
    this.logger.log('RevokeAuthToken: Attempting to log out user', {
      userId: user.id,
    });

    try {
      this.clearAuthTokenCookie(response);

      this.logger.log('RevokeAuthToken: User logged out successfully', {
        userId: user.id,
      });

      return { message: 'You have been logged out successfully.' };
    } catch (error) {
      this.logger.error('RevokeAuthToken: Failed to log out user', {
        userId: user.id,
        error: error.message,
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        'Failed to log out. Please try again.',
        {
          cause: error,
        }
      );
    }
  }

  private setAuthTokenCookie(
    response: Response,
    token: string,
    expiresIn: Date
  ): void {
    response.cookie(this.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      expires: expiresIn,
      // secure: this.isProduction,
      // sameSite: 'lax',
    });

    this.logger.debug('SetAuthTokenCookie: AuthToken cookie set', {
      secure: this.isProduction,
    });
  }

  private clearAuthTokenCookie(response: Response): void {
    response.clearCookie(this.AUTH_COOKIE_NAME, {
      httpOnly: true,
      // secure: this.isProduction,
      // sameSite: 'lax',
    });
    this.logger.debug('clearAuthTokenCookie: AuthToken cookie cleared');
  }
}
