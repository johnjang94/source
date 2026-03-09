import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Req,
} from '@nestjs/common';
import { ProjectIntakesService } from './project-intakes.service';
import { CreateProjectIntakeDto } from './dto/create-project-intake.dto';
import { UpdateProjectIntakeDto } from './dto/update-project-intake.dto';

@Controller('my/project-intakes')
export class ProjectIntakesController {
  constructor(private readonly projectIntakesService: ProjectIntakesService) {}

  @Get()
  async listMine(@Req() req: any) {
    const userId = req.user.id;
    const items = await this.projectIntakesService.listByUser(userId);
    return { ok: true, items };
  }

  @Get(':id')
  async getMine(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const intake = await this.projectIntakesService.findByIdForUser(id, userId);
    return { ok: true, intake };
  }

  @Post()
  async createMine(@Body() dto: CreateProjectIntakeDto, @Req() req: any) {
    const userId = req.user.id;
    const intake = await this.projectIntakesService.createForUser(dto, userId);
    return { ok: true, intake };
  }

  @Patch(':id')
  async updateMine(
    @Param('id') id: string,
    @Body() dto: UpdateProjectIntakeDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const intake = await this.projectIntakesService.updateForUser(
      id,
      dto,
      userId,
    );
    return { ok: true, intake };
  }

  @Delete(':id')
  async deleteMine(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.projectIntakesService.deleteForUser(id, userId);
  }
}
