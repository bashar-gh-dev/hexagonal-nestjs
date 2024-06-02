import { ObjectId, WithId } from 'mongodb';
import {
  UserRepositoryErrorCode,
  UserRepositoryOutputPort,
} from 'src/users/application/ports/output/UserRepositoryOutputPort';
import { User } from 'src/users/domain/entities/User';
import { Injectable } from '@nestjs/common';
import { NestMongodbService } from 'nest-mongodb';

export interface UserEntity {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class UserRepositoryMongoDbAdapter implements UserRepositoryOutputPort {
  constructor(private db: NestMongodbService) {}

  private USERS_COLLECTION_ID = 'users';

  private duplicateKeyErrorCode = '11000';

  async create(userData: Omit<User, 'id'>) {
    const _id = new ObjectId();
    try {
      await this.db
        .collection<UserEntity>(this.USERS_COLLECTION_ID)
        .insertOne({ ...userData, _id });
      return this.toDomain({ ...userData, _id });
    } catch (error) {
      if ((error as any).code == this.duplicateKeyErrorCode) {
        error['code'] = UserRepositoryErrorCode.DUPLICATED_USER;
      }
      throw error;
    }
  }

  async findById(id: string) {
    const userEntity = await this.db
      .collection<UserEntity>(this.USERS_COLLECTION_ID)
      .findOne({ _id: new ObjectId(id) });
    if (userEntity) return this.toDomain(userEntity);
    return undefined;
  }

  async findByEmail(email: string) {
    const userEntity = await this.db
      .collection<UserEntity>(this.USERS_COLLECTION_ID)
      .findOne({ email });
    if (userEntity) return this.toDomain(userEntity);
    return undefined;
  }

  private toRepository(userDomain: User): WithId<UserEntity> {
    const userRepository: WithId<UserEntity> = {
      _id: new ObjectId(userDomain.id),
      name: userDomain.email,
      password: userDomain.password,
      email: userDomain.email,
    };
    return userRepository;
  }

  private toDomain(userEntity: WithId<UserEntity>): User {
    const userDomain = new User(
      userEntity._id.toString(),
      userEntity.email,
      userEntity.name,
      userEntity.password,
    );
    return userDomain;
  }
}
