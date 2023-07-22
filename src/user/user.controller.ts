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
import { ChangePasswordDto, EditUserDto } from './dto';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(AccessTokenGuard)
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch(':id')
  editUser(
    @GetUser() user: User,
    @Body() dto: EditUserDto,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    this.checkIfUserIsAuthorized(user, userId);

    // if no data is provided
    if (!dto.fullName && !dto.birthday) {
      throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
    }

    return this.userService.editUser(userId, dto);
  }

  @Patch(':id/change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    this.checkIfUserIsAuthorized(user, userId);
    return this.userService.changePassword(userId, changePasswordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    this.checkIfUserIsAuthorized(user, userId);
    await this.userService.deleteUser(userId);
    return;
  }
  /**
   * Check if user is authorized to perform action
   * @param user user from access token
   * @param userId user id from url
   * @returns void
   * @throws ForbiddenException if user is not authorized
   */
  private checkIfUserIsAuthorized(user: User, userId: number) {
    if (user.id !== userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
