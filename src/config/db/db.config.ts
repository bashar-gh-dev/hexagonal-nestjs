import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, validateSync } from 'class-validator';

export class DbValidationSchema {
  @IsNotEmpty() @IsString() databaseName: string;
  @IsNotEmpty() @IsString() userName: string;
  @IsNotEmpty() @IsString() password: string;
}

export const dbConfig = registerAs('database', () => {
  const config = {
    databaseName: process.env.DB_DATABASE,
    userName: process.env.DB_PASSWORD,
    password: process.env.DB_USERNAME,
  };
  const configSchema = plainToInstance(DbValidationSchema, config, {
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
