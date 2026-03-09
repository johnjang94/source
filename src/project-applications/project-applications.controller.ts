import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ProjectApplicationsService } from './project-applications.service';
import { CreateProjectApplicationDto } from './dto/create-project-application.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('project-applications')
export class ProjectApplicationsController {
  constructor(
    private readonly projectApplicationsService: ProjectApplicationsService,
  ) {}

  @Post()
  async apply(@Body() dto: CreateProjectApplicationDto, @Req() req: any) {
    const userId = req.user.id;
    return this.projectApplicationsService.apply(userId, dto);
  }

  @Get('mine')
  async listMine(@Req() req: any) {
    const userId = req.user.id;
    return this.projectApplicationsService.listByUser(userId);
  }
}
