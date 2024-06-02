import { Module } from '@nestjs/common';
import { UserRepositoryOutputPort } from './application/ports/output/UserRepositoryOutputPort';
import { UserRepositoryMongoDbAdapter } from './framework/output/UserRepositoryMongoDbAdapter';
import { NestMongodbModule } from 'nest-mongodb';

@Module({
  imports: [NestMongodbModule.forFeature()],
  providers: [
    {
      provide: UserRepositoryOutputPort,
      useClass: UserRepositoryMongoDbAdapter,
    },
  ],
  exports: [UserRepositoryOutputPort],
})
export class UsersModule {}
