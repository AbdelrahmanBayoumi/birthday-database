import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto } from './dto';
import { GetUser } from './decorator';
import { User } from '@prisma/client';
import { JwtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('signup')
  signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Get('check')
  @UseGuards(JwtGuard)
  checkToken(@GetUser() user: User) {
    return user;
  }
}
