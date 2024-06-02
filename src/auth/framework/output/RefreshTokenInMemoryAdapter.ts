import { Injectable } from '@nestjs/common';
import { RefreshTokenOutputPort } from 'src/auth/application/ports/output/RefreshTokenOutputPort';

// To do: add Redis adapter instead of this shitty one.
const refreshTokens: { [userId: string]: string } = {};

@Injectable()
export class RefreshTokenInMemoryAdapter implements RefreshTokenOutputPort {
  async validate(userId: string, refreshToken: string): Promise<boolean> {
    return refreshTokens[userId] === refreshToken;
  }

  async invalidate(userId: string): Promise<void> {
    delete refreshTokens[userId];
  }

  async set(userId: string, refreshToken: string): Promise<void> {
    refreshTokens[userId] = refreshToken;
  }
}
