import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenPayload } from 'src/auth/application/ports/output/JwtOutputPort';
import { LOGGED_IN_USER_KEY } from '../constants/logged-in-user-key';

export const LoggedInUser = createParamDecorator(
  (_data: void, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const loggedInUser: AccessTokenPayload | undefined =
      request[LOGGED_IN_USER_KEY];
    if (!loggedInUser)
      throw new UnauthorizedException('Missing user access token');
    return loggedInUser;
  },
);
