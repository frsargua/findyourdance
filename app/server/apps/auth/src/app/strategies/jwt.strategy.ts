import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '../services/users.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { AUTH_COOKIE_NAME } from '@app/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return (
            request?.Authentication?.[AUTH_COOKIE_NAME] ||
            request?.cookies?.[AUTH_COOKIE_NAME] ||
            request?.[AUTH_COOKIE_NAME] ||
            request?.headers?.[AUTH_COOKIE_NAME]
          );
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate({ userId }: TokenPayload) {
    return this.usersService.getUser({ id: userId });
  }
}
