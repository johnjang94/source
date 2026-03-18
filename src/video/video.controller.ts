import { Controller, Get, Param } from '@nestjs/common';
import { VideoGateway } from './video.gateway';

@Controller('video')
export class VideoController {
  constructor(private readonly videoGateway: VideoGateway) {}

  @Get('active/:projectId')
  checkActive(@Param('projectId') projectId: string): { active: boolean } {
    return { active: this.videoGateway.isRoomActive(projectId) };
  }
}
