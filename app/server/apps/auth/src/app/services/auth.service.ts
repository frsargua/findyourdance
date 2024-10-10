import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { User } from '@app/common';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  private readonly AUTH_COOKIE_NAME = 'AuthToken';

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    protected logger: Logger
  ) {}

  async login(user: User, response: Response): Promise<{ message: string }> {
    this.logger.log('Attempting to log in user', { userId: user.id });

    const tokenPayload: TokenPayload = { userId: user.id.toString() };

    try {
      const jwtExpiration =
        this.configService.get<string>('JWT_EXPIRATION') || '1h';
      const token = await this.jwtService.signAsync(tokenPayload, {
        expiresIn: jwtExpiration,
      });
      this.logger.debug('JWT token generated successfully', {
        userId: user.id,
      });

      this.setAuthTokenCookie(response, token);

      this.logger.log('User logged in successfully', { userId: user.id });

      return { message: 'Login successful' };
    } catch (error) {
      this.logger.error('Failed to generate JWT token', {
        userId: user.id,
        error: error.message,
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        'Failed to log in. Please try again.'
      );
    }
  }

  async logout(user: User, response: Response): Promise<{ message: string }> {
    this.logger.log('Logout: Attempting to log out user', { userId: user.id });

    this.clearAuthTokenCookie(response);

    this.logger.log('Logout: User logged out successfully', {
      userId: user.id,
    });

    return { message: 'You have been logged out successfully.' };
  }

  private setAuthTokenCookie(response: Response, token: string): void {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    response.cookie(this.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    });

    this.logger.debug('SetAuthTokenCookie: AuthToken cookie set', {
      secure: isProduction,
    });
  }

  private clearAuthTokenCookie(response: Response): void {
    response.clearCookie(this.AUTH_COOKIE_NAME);
    this.logger.debug('clearAuthTokenCookie AuthToken cookie cleared');
  }
}
