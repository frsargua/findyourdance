import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from 'apps/auth/src/app/model/users.entity';

const getCurrentUserByContext = (context: ExecutionContext): User => {
  return context.switchToHttp().getRequest().user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context)
);
