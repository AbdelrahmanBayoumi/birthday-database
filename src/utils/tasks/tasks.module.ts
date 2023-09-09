import { Module } from '@nestjs/common';
import { RefreshTokenCleanupService } from './rt-cleanup.service';

@Module({
  providers: [RefreshTokenCleanupService],
})
export class TasksModule {}
