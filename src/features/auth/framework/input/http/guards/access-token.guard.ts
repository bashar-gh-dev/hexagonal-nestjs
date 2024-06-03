import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  JwtError,
  JWT_ERROR_KEY_NAME,
  JwtOutputPort,
} from '../../../../../auth/application/ports/output/JwtOutputPort';
import { Public } from '../decorators/public.decorator';
import { LOGGED_IN_USER_KEY } from '../constants/logged-in-user-key';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtOutputPort,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride(Public, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublicRoute) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken: string | undefined = request.cookies['accessToken'];
    if (!accessToken) throw new UnauthorizedException();
    try {
      const accessTokenPayload =
        await this.jwtService.verifyAccessToken(accessToken);
      request[LOGGED_IN_USER_KEY] = accessTokenPayload;
      return true;
    } catch (e) {
      if (e[JWT_ERROR_KEY_NAME] === JwtError.EXPIRED) {
        throw new ForbiddenException('Expired access token');
      }
      throw new UnauthorizedException();
    }
  }
}
