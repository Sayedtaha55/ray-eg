import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  getTest() {
    return {
      message: 'Backend is working!',
      timestamp: new Date().toISOString(),
      status: 'ok'
    };
  }
}
