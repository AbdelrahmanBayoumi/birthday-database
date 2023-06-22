import {
  Controller,
  Delete,
  Patch,
  Body,
  UseGuards,
  BadRequestException,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    if (!dto.fullName && !dto.birthday) {
      throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
    }

    return this.userService.editUser(userId, dto);
  }

  @Delete()
  deleteUser(@GetUser('id') userId: number) {
    return this.userService.deleteUser(userId);
  }
}