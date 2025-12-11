import { AppController } from './app.controller';
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { BirthdayModule } from './birthday/birthday.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserSensitiveDataInterceptor } from './interceptors';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import * as favicon from 'serve-favicon';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './utils/tasks/tasks.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ScheduleModule.forRoot(),
    TasksModule,
    // ThrottlerModule.forRoot({
    //   ttl: 60,
    //   limit: 100,
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    BirthdayModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: UserSensitiveDataInterceptor,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(favicon(join(__dirname, '..', 'public', 'assets', 'icon.png')))
      .forRoutes('');
  }
}
