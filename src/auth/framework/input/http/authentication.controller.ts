import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Response, Request } from 'express';
import { AccessTokenGuard } from 'src/auth/framework/input/http/guards/access-token.guard';
import { Public } from 'src/auth/framework/input/http/decorators/public.decorator';
import { LoggedInUser } from 'src/auth/framework/input/http/decorators/logged-in-user.decorator';
import { AuthenticationUseCase } from 'src/auth/application/use-cases/AuthenticationUseCase';
import { AccessTokenPayload } from 'src/auth/application/ports/output/JwtOutputPort';

@UseGuards(AccessTokenGuard)
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationUseCase) {}

  @Public()
  @Post('sign-up')
  async signUp(
    @Res({ passthrough: true }) response: Response,
    @Body() signUpDto: SignUpDto,
  ) {
    const { refreshToken, accessToken } =
      await this.authService.signUp(signUpDto);
    response.cookie('accessToken', accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
    response.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    const { refreshToken, accessToken } =
      await this.authService.signIn(signInDto);
    response.cookie('accessToken', accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
    response.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
  }

  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken() {}

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async logout(
    @LoggedInUser() loggedInUser: AccessTokenPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.signOut(loggedInUser.sub);
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const oldRefreshToken = request.cookies['refreshToken'];
    const { refreshToken, accessToken } =
      await this.authService.refreshToken(oldRefreshToken);
    response.cookie('accessToken', accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
    response.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
  }
}
