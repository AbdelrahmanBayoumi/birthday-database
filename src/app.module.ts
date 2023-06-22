import { AppController } from './app.controller';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api*'],
    }),
    // LoggerModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
