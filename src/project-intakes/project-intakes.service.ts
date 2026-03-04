import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { ProjectIntake } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectIntakeDto } from './dto/create-project-intake.dto';

@Injectable()
export class ProjectIntakesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ProjectIntake[]> {
    try {
      return await this.prisma.projectIntake.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      throw new InternalServerErrorException('Failed to list project intakes');
    }
  }

  async create(dto: CreateProjectIntakeDto): Promise<ProjectIntake> {
    try {
      return await this.prisma.projectIntake.create({
        data: {
          clientUserId: dto.clientUserId,
          projectName: dto.projectName,
          timeInvestment: dto.timeInvestment,
          budgetRange: dto.budgetRange,
          projectDescription: dto.projectDescription,
          goals: dto.goals,
        },
      });
    } catch {
      throw new InternalServerErrorException('Failed to create project intake');
    }
  }
}
