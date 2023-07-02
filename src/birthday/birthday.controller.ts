import { BirthdayService } from './birthday.service';
import {
  Controller,
  Get,
  HttpCode,
  Delete,
  Patch,
  Body,
  HttpStatus,
  UseGuards,
  Param,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { AccessTokenGuard, VerificationGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { CreateBirthdayDto, EditBirthdayDto } from './dto';
import { User } from '@prisma/client';

@UseGuards(AccessTokenGuard, VerificationGuard)
@Controller('birthday')
export class BirthdayController {
  constructor(private birthdayService: BirthdayService) {}

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.birthdayService.findAll(user);
  }

  @Get(':id')
  findOne(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) birthdayId: number,
  ) {
    return this.birthdayService.findOne(user, birthdayId);
  }

  @Post()
  create(@GetUser() user: User, @Body() createBirthdayDto: CreateBirthdayDto) {
    return this.birthdayService.create(user, createBirthdayDto);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) birthdayId: number,
    @Body() editBirthdayDto: EditBirthdayDto,
  ) {
    return this.birthdayService.update(user, birthdayId, editBirthdayDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@GetUser() user: User, @Param('id', ParseIntPipe) birthdayId: number) {
    return this.birthdayService.delete(user, birthdayId);
  }
}
