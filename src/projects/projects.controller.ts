import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Delete,
  Post,
  Body,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { UpdateProjectDto } from './update-project.dto';
import { UpdateProjectBriefDto } from './update-project-brief.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly service: ProjectsService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Get('public')
  async findPublic(@AuthUser() user?: { id: string }) {
    const items = await this.service.findPublic(user?.id);
    return { ok: true, items };
  }

  @Get('public/:id')
  async findPublicById(@Param('id') id: string) {
    const item = await this.service.findPublicById(id);
    return { ok: true, item };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('list')
  async findParticipantList(@AuthUser() user: { id: string }) {
    const items = await this.service.findParticipantList(user.id);
    return { ok: true, items };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('list/:id')
  async findParticipantListById(
    @Param('id') id: string,
    @AuthUser() user: { id: string },
  ) {
    const item = await this.service.findParticipantListById(id, user.id);
    return { ok: true, item };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async findMine(@AuthUser() user: { id: string }) {
    const items = await this.service.findMine(user.id);
    return { ok: true, items };
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/brief')
  async updateBrief(
    @Param('id') id: string,
    @Body() dto: UpdateProjectBriefDto,
    @AuthUser() user: { id: string },
  ) {
    const item = await this.service.updateBrief(id, user.id, dto);
    return { ok: true, item };
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @AuthUser() user: { id: string },
  ) {
    const item = await this.service.updateStatus(id, user.id, body.status);
    // Emit real-time status change to the project owner
    this.notificationsGateway.server
      .to(user.id)
      .emit('project_status_changed', { projectId: id, status: body.status });
    return { ok: true, item };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post(':id/start-recruiting')
  async startRecruiting(
    @Param('id') id: string,
    @AuthUser() user: { id: string },
  ) {
    const item = await this.service.updateStatus(id, user.id, 'recruiting');
    // Emit real-time status change to the project owner
    this.notificationsGateway.server
      .to(user.id)
      .emit('project_status_changed', { projectId: id, status: 'recruiting' });
    return { ok: true, item };
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async updateMine(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @AuthUser() user: { id: string },
  ) {
    const item = await this.service.updateMine(id, user.id, dto);
    return { ok: true, item };
  }

  @Get('company/:userId')
  async getCompany(@Param('userId') userId: string) {
    const company = await this.service.getCompanyByUserId(userId);
    return { ok: true, company };
  }

  @Get(':projectId/resume/:participantId')
  async getResume(
    @Param('projectId') projectId: string,
    @Param('participantId') participantId: string,
  ) {
    const resume = await this.service.getResumeForProject(projectId, participantId);
    return { ok: true, resume };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  async deleteMine(@Param('id') id: string, @AuthUser() user: { id: string }) {
    const item = await this.service.deleteMine(id, user.id);
    return { ok: true, item };
  }
}
