import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

const atLeastOneSpecialCharRegExp = /[!@#$%^&*()_+{}\[\]:;<>,.?\/\\~-]/;
const atLeastOneLetterRegExp = /[a-zA-Z]/;
const atLeastOneDigitRegExp = /\d/;

export class SignUpDto {
  @IsEmail({}, { message: 'invalid email address' })
  email: string;

  @MinLength(8)
  @Matches(atLeastOneSpecialCharRegExp, {
    message: 'password must contains at least one special character',
  })
  @Matches(atLeastOneDigitRegExp, {
    message: 'password must contains at least one digit',
  })
  @Matches(atLeastOneLetterRegExp, {
    message: 'password must contains at least one letter',
  })
  password: string;

  @IsString() name: string;
}
