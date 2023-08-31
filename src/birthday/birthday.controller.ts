import { BirthdayService } from './birthday.service';
import { CreateBirthdayDto, EditBirthdayDto } from './dto';
import {
  Controller,
  Delete,
  HttpCode,
  Patch,
  Get,
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
import { AccessTokenGuard, VerificationGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseService } from '../utils/firebase.service';

@UseGuards(AccessTokenGuard, VerificationGuard)
@ApiTags('birthday')
@Controller('birthday')
export class BirthdayController {
  constructor(
    private birthdayService: BirthdayService,
    private readonly firebaseService: FirebaseService,
  ) {}

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

  @Get('relationships')
  async getRelationships(@GetUser() user: User) {
    return await this.birthdayService.getRelationships(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/upload-image')
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
    @Param('id', ParseIntPipe) birthdayId: number,
  ): Promise<{ url: string }> {
    let imageUrl = null;
    if (image) {
      const filename = await this.firebaseService.uploadImage(image);
      imageUrl = `https://storage.googleapis.com/${process.env.BUCKET}/${filename}`;
    }
    console.log('imageUrl:', imageUrl);

    await this.birthdayService.addAvatar(birthdayId, imageUrl);
    return { url: imageUrl };
  }
}
