import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AUTH_COOKIE_NAME, AUTH_SERVICE } from '../constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly logger: Logger
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const jwt =
      context.switchToHttp().getRequest().cookies?.[AUTH_COOKIE_NAME] ||
      context.switchToHttp().getRequest().headers?.[AUTH_COOKIE_NAME];

    if (!jwt) {
      this.logger.warn(`Token not found`);
      return false;
    }

    return this.authClient.send('authenticate', { Authentication: jwt }).pipe(
      tap((res) => {
        context.switchToHttp().getRequest().user = res;
      }),
      map(() => true),
      catchError((err) => {
        this.logger.error(err);
        return of(false);
      })
    );
  }
}
