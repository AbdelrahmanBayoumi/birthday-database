import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HashService } from '../utils/hash.service';
import { FirebaseService } from '../utils/firebase.service';
import { EmailModule } from '../modules/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [UserController],
  providers: [UserService, HashService, FirebaseService],
})
export class UserModule {}
