import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProjectRolesService } from './project-roles.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { CreateProjectRoleDto, UpdateProjectRoleDto } from './project-roles.dto';

@Controller('project-roles')
export class ProjectRolesController {
  constructor(private readonly service: ProjectRolesService) {}

  @Get(':projectId')
  async findByProject(@Param('projectId') projectId: string) {
    const roles = await this.service.findByProject(projectId);
    return { ok: true, roles };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateProjectRoleDto,
    @AuthUser() user: { id: string },
  ) {
    const role = await this.service.create(user.id, dto);
    return { ok: true, role };
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectRoleDto,
    @AuthUser() user: { id: string },
  ) {
    const role = await this.service.update(user.id, id, dto);
    return { ok: true, role };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @AuthUser() user: { id: string },
  ) {
    await this.service.remove(user.id, id);
    return { ok: true };
  }
}
