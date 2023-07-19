import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health-check')
  helthCheck(): string {
    return "I'm alive!";
  }

  @Get('/')
  getHello(): string {
    return 'Hello World!';
  }
}
