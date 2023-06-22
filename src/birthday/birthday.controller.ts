import { BirthdayService } from './birthday.service';
import { Controller, Delete, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';

@UseGuards(JwtGuard)
@Controller('birthday')
export class BirthdayController {
  constructor(private birthdayService: BirthdayService) {}
}
