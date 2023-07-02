import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HashService } from '../utils/hash.service';

@Module({
  controllers: [UserController],
  providers: [UserService, HashService],
})
export class UserModule {}
