import { Module } from '@nestjs/common';
import { VideoGateway } from './video.gateway';
import { VideoController } from './video.controller';

@Module({
  controllers: [VideoController],
  providers: [VideoGateway],
  exports: [VideoGateway],
})
export class VideoModule {}
