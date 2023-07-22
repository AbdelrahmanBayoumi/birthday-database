import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, EmailDto } from './dto';
import { GetUser } from './decorator';
import { User } from '@prisma/client';
import { AccessTokenGuard, RefreshTokenGuard } from './guard';
import { Tokens } from './types';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOkResponse({ description: 'succes signup endpoint' })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignUpDto): Promise<Tokens> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<Tokens> {
    return this.authService.login(dto);
  }

  @ApiOkResponse({ description: 'check token endpoint' })
  @Get('check')
  @UseGuards(AccessTokenGuard)
  checkToken(@GetUser() user: User) {
    user.createdAt = undefined;
    user.updatedAt = undefined;
    user.hash = undefined;
    user.hashedRt = undefined;
    return user;
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('id') userId: number) {
    this.authService.logout(userId);
    return;
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  refreshToken(@GetUser() user: User) {
    return this.authService.refreshTokens(user);
  }

  @Get('/verification/:token')
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  resendVerification(@Body() dto: EmailDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  forgetPassword(@Body() dto: EmailDto) {
    return this.authService.forgetPassword(dto.email);
  }
}
