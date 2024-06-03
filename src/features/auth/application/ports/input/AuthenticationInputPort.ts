import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthenticationUseCase,
  RefreshTokenResponse,
  SignInData,
  SignInResponse,
  SignUpData,
  SignUpResponse,
} from '../../use-cases/AuthenticationUseCase';
import { HashingOutputPort } from '../output/HashingOutputPort';
import {
  UserRepositoryErrorCode,
  UserRepositoryOutputPort,
} from '../../../../users/application/ports/output/UserRepositoryOutputPort';
import { RefreshTokenOutputPort } from '../output/RefreshTokenOutputPort';
import { JwtOutputPort } from '../output/JwtOutputPort';

@Injectable()
export class AuthenticationInputPort implements AuthenticationUseCase {
  constructor(
    private readonly hashingService: HashingOutputPort,
    private readonly refreshTokenStorageService: RefreshTokenOutputPort,
    private readonly userRepositoryService: UserRepositoryOutputPort,
    private readonly jwtService: JwtOutputPort,
  ) {}

  async signUp(signUpData: SignUpData): Promise<SignUpResponse> {
    const hashedPassword = await this.hashingService.hash(signUpData.password);
    try {
      const user = await this.userRepositoryService.create({
        name: signUpData.name,
        email: signUpData.email,
        password: hashedPassword,
      });
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.generateAccessToken({
          sub: user.id,
          email: user.email,
        }),
        this.jwtService.generateRefreshToken({ sub: user.id }),
      ]);
      await this.refreshTokenStorageService.invalidate(user.id);
      await this.refreshTokenStorageService.set(user.id, refreshToken);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error['code'] == UserRepositoryErrorCode.DUPLICATED_USER)
        throw new ConflictException('User already exists');
      throw error;
    }
  }

  async signIn(signInData: SignInData): Promise<SignInResponse> {
    const user = await this.userRepositoryService.findByEmail(signInData.email);
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    const isEqual = await this.hashingService.compare(
      signInData.password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Wrong password');
    }
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateAccessToken({
        sub: user.id,
        email: user.email,
      }),
      this.jwtService.generateRefreshToken({ sub: user.id }),
    ]);
    await this.refreshTokenStorageService.invalidate(user.id);
    await this.refreshTokenStorageService.set(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const { sub } = await this.jwtService.verifyRefreshToken(oldRefreshToken);
      const isValid = await this.refreshTokenStorageService.validate(
        sub,
        oldRefreshToken,
      );
      if (!isValid) throw new UnauthorizedException('Invalid refresh token');
      const user = await this.userRepositoryService.findById(sub);
      if (!user) throw new NotFoundException('User not found');
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.generateAccessToken({
          sub: user.id,
          email: user.email,
        }),
        this.jwtService.generateRefreshToken({ sub: user.id }),
      ]);
      await this.refreshTokenStorageService.invalidate(user.id);
      await this.refreshTokenStorageService.set(user.id, refreshToken);
      return { accessToken, refreshToken };
    } catch (_e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signOut(userId: string): Promise<void> {
    await this.refreshTokenStorageService.invalidate(userId);
  }
}
