import { AppController } from './app.controller';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { BirthdayModule } from './birthday/birthday.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // LoggerModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    BirthdayModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
