import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // cors: true = allow all the request from any domain
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bufferLogs: true,
  });

  // [whitelist: true] = remove all the properties that are not defined in the DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT || 3333);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
