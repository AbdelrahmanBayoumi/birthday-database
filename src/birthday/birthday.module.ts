import { Module } from '@nestjs/common';
import { BirthdayService } from './birthday.service';
import { BirthdayController } from './birthday.controller';
import { FirebaseService } from '../utils/firebase.service';

@Module({
  providers: [BirthdayService, FirebaseService],
  controllers: [BirthdayController],
})
export class BirthdayModule {}
