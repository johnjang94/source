import { Body, Controller, Get, Post } from '@nestjs/common';
import type { ProjectIntake } from '@prisma/client';
import { CreateProjectIntakeDto } from './dto/create-project-intake.dto';
import { ProjectIntakesService } from './project-intakes.service';

type CreateProjectIntakeResponse = {
  ok: true;
  intake: ProjectIntake;
};

type ListProjectIntakesResponse = {
  ok: true;
  items: ProjectIntake[];
};

@Controller('project-intakes')
export class ProjectIntakesController {
  constructor(private readonly service: ProjectIntakesService) {}

  @Get()
  async list(): Promise<ListProjectIntakesResponse> {
    const items = await this.service.list();
    return { ok: true, items };
  }

  @Post()
  async create(
    @Body() dto: CreateProjectIntakeDto,
  ): Promise<CreateProjectIntakeResponse> {
    const intake = await this.service.create(dto);
    return { ok: true, intake };
  }
}
