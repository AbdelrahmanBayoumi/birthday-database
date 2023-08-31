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
  UseInterceptors,
  Post,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { ChangePasswordDto, EditUserDto } from './dto';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseService } from '../utils/firebase.service';

@UseGuards(AccessTokenGuard)
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private readonly firebaseService: FirebaseService,
  ) {}

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

  @HttpCode(HttpStatus.OK)
  @Post('upload-profile-image')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException(
              'Only image files (jpg, jpeg, png) are allowed!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() image: Express.Multer.File,
    @GetUser('id') id: number,
  ): Promise<{ url: string }> {
    let imageUrl = null;
    if (image) {
      const filename = await this.firebaseService.uploadImage(image);
      imageUrl = `https://storage.googleapis.com/${process.env.BUCKET}/${filename}`;
    }

    await this.userService.addAvatar(id, imageUrl);
    return { url: imageUrl };
  }
}
