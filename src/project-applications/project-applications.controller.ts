import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectApplicationsService } from './project-applications.service';
import { CreateProjectApplicationDto } from './dto/create-project-application.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';

@UseGuards(SupabaseAuthGuard)
@Controller('project-applications')
export class ProjectApplicationsController {
  constructor(
    private readonly projectApplicationsService: ProjectApplicationsService,
  ) {}

  @Post()
  async apply(
    @Body() dto: CreateProjectApplicationDto,
    @AuthUser() user: { id: string },
  ) {
    return this.projectApplicationsService.apply(user.id, dto);
  }

  @Get('mine')
  async listMine(@AuthUser() user: { id: string }) {
    return this.projectApplicationsService.listByUser(user.id);
  }

  @Get('by-project')
  async listByProject(@Query('projectId') projectId: string) {
    return this.projectApplicationsService.listByProject(projectId);
  }
}
