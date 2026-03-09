import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { UpdateProjectDto } from './update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get('public')
  async findPublic(@AuthUser() user: { id: string }) {
    const items = await this.service.findPublic(user.id);
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
  @Patch(':id')
  async updateMine(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @AuthUser() user: { id: string },
  ) {
    const item = await this.service.updateMine(id, user.id, dto);
    return { ok: true, item };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  async deleteMine(@Param('id') id: string, @AuthUser() user: { id: string }) {
    const item = await this.service.deleteMine(id, user.id);
    return { ok: true, item };
  }
}
