export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
}

export const JWT_ERROR_KEY_NAME = 'jwtError';

export const enum JwtError {
  EXPIRED,
}

export abstract class JwtOutputPort {
  abstract generateAccessToken(payload: AccessTokenPayload): Promise<string>;
  abstract generateRefreshToken(payload: RefreshTokenPayload): Promise<string>;
  abstract verifyAccessToken(accessToken: string): Promise<AccessTokenPayload>;
  abstract verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload>;
}
