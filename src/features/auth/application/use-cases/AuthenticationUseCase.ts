export interface SignUpData {
  email: string;
  name: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export abstract class AuthenticationUseCase {
  abstract signUp(signUpData: SignUpData): Promise<SignUpResponse>;
  abstract signIn(signInData: SignInData): Promise<SignInResponse>;
  abstract refreshToken(oldRefreshToken: string): Promise<RefreshTokenResponse>;
  abstract signOut(userId: string): Promise<void>;
}
