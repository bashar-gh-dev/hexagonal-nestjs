import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { HashingOutputPort } from '../../../auth/application/ports/output/HashingOutputPort';

@Injectable()
export class HashingBcryptAdapter implements HashingOutputPort {
  async compare(data: string, hashedData: string) {
    return await compare(data, hashedData);
  }

  async hash(data: string) {
    const slat = await genSalt();
    return hash(data, slat);
  }
}
