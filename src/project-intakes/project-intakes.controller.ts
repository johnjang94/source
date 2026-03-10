import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectIntakesService } from './project-intakes.service';
import { CreateProjectIntakeDto } from './dto/create-project-intake.dto';
import { UpdateProjectIntakeDto } from './dto/update-project-intake.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('project-intakes')
export class ProjectIntakesController {
  constructor(private readonly projectIntakesService: ProjectIntakesService) {}

  @Get()
  async listMine(@Req() req: any) {
    const userId = req.user.id;
    return this.projectIntakesService.listByUser(userId);
  }

  @Get(':id')
  async getMine(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.projectIntakesService.findByIdForUser(id, userId);
  }

  @Post()
  async create(@Body() dto: CreateProjectIntakeDto, @Req() req: any) {
    const userId = req.user.id;
    return this.projectIntakesService.createForUser(userId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectIntakeDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.projectIntakesService.updateForUser(id, userId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.projectIntakesService.deleteForUser(id, userId);
  }
}
