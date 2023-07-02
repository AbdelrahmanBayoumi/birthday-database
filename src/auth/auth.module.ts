import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { HashService } from '../utils/hash.service';
import { MailUtil } from '../utils/MailUtil';

@Module({
  imports: [
    JwtModule.register({}),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.FROM_EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    HashService,
    MailUtil,
  ],
})
export class AuthModule {}
