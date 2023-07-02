import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';

@Injectable()
export class HashService {
  /**
   * hash the data using argon2
   * @param data data to be hashed
   * @returns hashed data
   */
  async generateHash(plainText: string): Promise<string> {
    // TODO: add salt to the hash
    return await argon.hash(plainText);
  }

  /**
   * verify the hash and return true if the password matches the hash
   * @param hash hashed password
   * @param plain plain text password
   * @returns true if the password matches the hash otherwise false
   */
  async verifyHashed(hash: string, plainText: string): Promise<boolean> {
    return await argon.verify(hash, plainText);
  }
}
