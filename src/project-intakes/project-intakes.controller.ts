import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { ProjectIntake } from '@prisma/client';
import { CreateProjectIntakeDto } from './dto/create-project-intake.dto';
import { UpdateProjectIntakeDto } from './dto/update-project-intake.dto';
import { ProjectIntakesService } from './project-intakes.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';

type CreateProjectIntakeResponse = {
  ok: true;
  intake: ProjectIntake;
};

type ListProjectIntakesResponse = {
  ok: true;
  items: ProjectIntake[];
};

type GetProjectIntakeResponse = {
  ok: true;
  intake: ProjectIntake;
};

type UpdateProjectIntakeResponse = {
  ok: true;
  intake: ProjectIntake;
};

@UseGuards(SupabaseAuthGuard)
@Controller('my/project-intakes')
export class ProjectIntakesController {
  constructor(private readonly service: ProjectIntakesService) {}

  @Get()
  async list(
    @AuthUser() user: { id: string },
  ): Promise<ListProjectIntakesResponse> {
    const items = await this.service.listByUser(user.id);
    return { ok: true, items };
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @AuthUser() user: { id: string },
  ): Promise<GetProjectIntakeResponse> {
    const intake = await this.service.findByIdForUser(id, user.id);
    return { ok: true, intake };
  }

  @Post()
  async create(
    @Body() dto: CreateProjectIntakeDto,
    @AuthUser() user: { id: string; email: string },
  ): Promise<CreateProjectIntakeResponse> {
    const intake = await this.service.createForUser(dto, user);
    return { ok: true, intake };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectIntakeDto,
    @AuthUser() user: { id: string },
  ): Promise<UpdateProjectIntakeResponse> {
    const intake = await this.service.updateForUser(id, user.id, dto);
    return { ok: true, intake };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @AuthUser() user: { id: string },
  ): Promise<{ ok: true }> {
    await this.service.deleteForUser(id, user.id);
    return { ok: true };
  }
}
