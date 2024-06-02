import { IsEmail, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'invalid email address' })
  email!: string;

  @MinLength(8)
  password!: string;
}
