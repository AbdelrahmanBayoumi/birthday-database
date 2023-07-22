import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiOkResponse({ description: 'Health check endpoint' })
  @Get('/health-check')
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }

  @ApiOkResponse({ description: 'Hello World endpoint' })
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
