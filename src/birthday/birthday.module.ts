import { Module } from '@nestjs/common';
import { BirthdayService } from './birthday.service';
import { BirthdayController } from './birthday.controller';

@Module({
  providers: [BirthdayService],
  controllers: [BirthdayController],
})
export class BirthdayModule {}
