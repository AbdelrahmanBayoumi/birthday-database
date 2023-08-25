import { AppController } from './app.controller';
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { BirthdayModule } from './birthday/birthday.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserSensitiveDataInterceptor } from './interceptors';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ServeFaviconMiddleware } from '@nest-middlewares/serve-favicon';
import { join } from 'path';

@Module({
  imports: [
    LoggerModule.forRoot(),
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
    // IMPORTANT! Call Middleware.configure BEFORE using it for routes
    ServeFaviconMiddleware.configure(
      join(__dirname, '..', 'public', 'assets', 'icon.png'),
    );
    consumer.apply(ServeFaviconMiddleware).forRoutes('');
  }
}
