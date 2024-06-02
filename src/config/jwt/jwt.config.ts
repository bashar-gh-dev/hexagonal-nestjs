import { registerAs } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class JWTConfigValidationSchema {
  @IsNotEmpty() @IsString() secret: string;
  @IsNotEmpty() @IsString() accessTokenSecret: string;
  @IsNotEmpty() @IsString() refreshTokenTokenSecret: string;
  @IsNotEmpty() @IsString() audience: string;
  @IsNotEmpty() @IsString() issuer: string;
  @IsNumber() @Min(5) @Max(3600) accessTokenTtl: number;
  @IsNumber() @Min(3600) @Max(36000) refreshTokenTtl: number;
}

export const jwtConfig = registerAs('jwt', () => {
  const config = {
    secret: process.env.JWT_ACCESS_SECRET,
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenTokenSecret: process.env.JWT_REFRESH_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL,
    refreshTokenTtl: process.env.JWT_REFRESH_TOKEN_TTL,
  };
  const configSchema = plainToInstance(JWTConfigValidationSchema, config, {
    enableImplicitConversion: true,
  });
  const validationErrors = validateSync(configSchema);
  if (validationErrors.length > 0) {
    const invalidKeys = validationErrors
      .map((validationError) => validationError.property)
      .join(', ');
    throw new InternalServerErrorException(
      `Invalid environment key/keys: ${invalidKeys}`,
    );
  }
  return configSchema;
});
