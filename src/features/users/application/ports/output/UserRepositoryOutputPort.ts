import { User } from '../../../../users/domain/entities/User';

export const enum UserRepositoryErrorCode {
  DUPLICATED_USER,
}

export abstract class UserRepositoryOutputPort {
  abstract create(user: Omit<User, 'id'>): Promise<User>;
  abstract findById(id: User['id']): Promise<User | undefined>;
  abstract findByEmail(email: User['email']): Promise<User | undefined>;
}
