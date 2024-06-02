import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt/jwt.config';
import {
  AccessTokenPayload,
  JwtError,
  JWT_ERROR_KEY_NAME,
  JwtOutputPort,
  RefreshTokenPayload,
} from 'src/auth/application/ports/output/JwtOutputPort';

@Injectable()
export class JwtNestJsAdapter implements JwtOutputPort {
  constructor(
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    const accessTokenPayload: AccessTokenPayload = {
      sub: payload.sub,
      email: payload.email,
    };
    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      secret: this.jwtConfiguration.accessTokenSecret,
      expiresIn: this.jwtConfiguration.accessTokenTtl,
    });
    return accessToken;
  }

  async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    const refreshTokenPayload: RefreshTokenPayload = { sub: payload.sub };
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: this.jwtConfiguration.refreshTokenTokenSecret,
      expiresIn: this.jwtConfiguration.refreshTokenTtl,
    });
    return refreshToken;
  }

  async verifyAccessToken(
    accessToken: string,
  ): Promise<{ sub: string; email: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        accessToken,
        {
          secret: this.jwtConfiguration.accessTokenSecret,
        },
      );
      return payload;
    } catch (e) {
      if (e.name === TokenExpiredError.name) {
        e[JWT_ERROR_KEY_NAME] = JwtError.EXPIRED;
      }
      throw e;
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<{ sub: string }> {
    const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
      refreshToken,
      { secret: this.jwtConfiguration.refreshTokenTokenSecret },
    );
    return payload;
  }
}
