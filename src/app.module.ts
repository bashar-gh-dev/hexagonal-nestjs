import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { NestMongodbModule } from 'nest-mongodb';
import { dbConfig } from './config/db/db.config';

@Module({
  imports: [
    NestMongodbModule.forRoot({
      imports: [ConfigModule.forFeature(dbConfig)],
      inject: [dbConfig.KEY],
      useFactory: async (dbConfiguration: ConfigType<typeof dbConfig>) => ({
        userName: dbConfiguration.userName,
        password: dbConfiguration.password,
        database: dbConfiguration.databaseName,
      }),
    }),
    ConfigModule.forRoot({
      envFilePath: ['src/.env/jwt.env', 'src/.env/type-orm.env'],
    }),
    AuthModule,
  ],
})
export class AppModule {}
