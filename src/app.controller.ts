import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/health-check')
  helthCheck(): string {
    return "I'm alive!";
  }
}
