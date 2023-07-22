import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // cors: true = allow all the request from any domain
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bufferLogs: true,
  });

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Birthday Database API')
    .setDescription('Birthday Database API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useLogger(app.get(Logger));

  // [whitelist: true] = remove all the properties that are not defined in the DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT || 3333);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
