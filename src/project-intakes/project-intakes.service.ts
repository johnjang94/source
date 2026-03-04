import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { ProjectIntake } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectIntakeDto } from './dto/create-project-intake.dto';
import { UpdateProjectIntakeDto } from './dto/update-project-intake.dto';

@Injectable()
export class ProjectIntakesService {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: string): Promise<ProjectIntake[]> {
    try {
      return await this.prisma.projectIntake.findMany({
        where: { clientUserId: userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      throw new InternalServerErrorException('Failed to list project intakes');
    }
  }

  async findByIdForUser(id: string, userId: string): Promise<ProjectIntake> {
    try {
      const intake = await this.prisma.projectIntake.findFirst({
        where: { id, clientUserId: userId },
      });

      if (!intake) throw new NotFoundException('Project intake not found');
      return intake;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to get project intake');
    }
  }

  async createForUser(
    dto: CreateProjectIntakeDto,
    user: { id: string; email: string },
  ) {
    return this.prisma.projectIntake.create({
      data: {
        clientUserId: user.id,
        email: user.email,
        projectName: dto.projectName,
        timeInvestment: dto.timeInvestment,
        budgetRange: dto.budgetRange,
        projectDescription: dto.projectDescription,
        goals: dto.goals,
      },
    });
  }

  async updateForUser(
    id: string,
    userId: string,
    dto: UpdateProjectIntakeDto,
  ): Promise<ProjectIntake> {
    const hasAnyField =
      dto.projectName !== undefined ||
      dto.timeInvestment !== undefined ||
      dto.budgetRange !== undefined ||
      dto.projectDescription !== undefined ||
      dto.goals !== undefined;

    if (!hasAnyField) {
      throw new BadRequestException('No fields to update');
    }

    try {
      const existing = await this.prisma.projectIntake.findFirst({
        where: { id, clientUserId: userId },
        select: { id: true },
      });

      if (!existing) {
        throw new NotFoundException('Project intake not found');
      }

      return await this.prisma.projectIntake.update({
        where: { id },
        data: {
          ...(dto.projectName !== undefined
            ? { projectName: dto.projectName }
            : {}),
          ...(dto.timeInvestment !== undefined
            ? { timeInvestment: dto.timeInvestment }
            : {}),
          ...(dto.budgetRange !== undefined
            ? { budgetRange: dto.budgetRange }
            : {}),
          ...(dto.projectDescription !== undefined
            ? { projectDescription: dto.projectDescription }
            : {}),
          ...(dto.goals !== undefined ? { goals: dto.goals } : {}),
        },
      });
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      if (e instanceof BadRequestException) throw e;
      throw new InternalServerErrorException('Failed to update project intake');
    }
  }
}
