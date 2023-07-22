import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health-check')
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }

  // return a plain text string as a response to the GET request to the root path
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
