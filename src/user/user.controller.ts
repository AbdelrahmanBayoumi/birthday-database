import {
  Controller,
  Delete,
  HttpCode,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@UseGuards(AccessTokenGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch(':id')
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    if (!dto.fullName && !dto.birthday) {
      throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
    }

    return this.userService.editUser(userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    if (user.id !== userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await this.userService.deleteUser(userId);
    return;
  }
}
