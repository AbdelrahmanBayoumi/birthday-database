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
    return `<!DOCTYPE html> <html> <head> <title>Email Activation</title> </head> <body style=" background-color: #f5f7fe; text-align: center; " > <div style=" height: 100vh; display: flex; align-items: center; justify-content: center; " > <div style=" padding: 40px; display: flex; flex-direction: column; background: #fff; border-radius: 20px; box-shadow: 2px 3px 10px #00000029; " > <h1>📅 Birthday Database</h1> <h2> ✅ go to <a href='/api'>/api</a> for docs. </h2>  </div> </div> </body> </html>`;
  }
}
