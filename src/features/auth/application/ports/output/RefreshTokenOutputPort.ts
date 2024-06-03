export abstract class RefreshTokenOutputPort {
  abstract validate(userId: string, refreshToken: string): Promise<boolean>;
  abstract invalidate(userId: string): Promise<void>;
  abstract set(userId: string, refreshToken: string): Promise<void>;
}
