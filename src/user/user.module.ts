import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HashService } from '../utils/hash.service';
import { MailUtil } from '../utils/MailUtil';

@Module({
  controllers: [UserController],
  providers: [UserService, HashService, MailUtil],
})
export class UserModule {}
