import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HashService } from '../utils/hash.service';
import { MailUtil } from '../utils/MailUtil';
import { FirebaseService } from '../utils/firebase.service';

@Module({
  controllers: [UserController],
  providers: [UserService, HashService, MailUtil, FirebaseService],
})
export class UserModule {}
