import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectIntakeDto } from './dto/create-project-intake.dto';
import { UpdateProjectIntakeDto } from './dto/update-project-intake.dto';

@Injectable()
export class ProjectIntakesService {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: string) {
    return this.prisma.projectIntake.findMany({
      where: {
        clientUserId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByIdForUser(id: string, userId: string) {
    const intake = await this.prisma.projectIntake.findUnique({
      where: { id },
    });

    if (!intake) {
      throw new NotFoundException('Project intake not found.');
    }

    if (intake.clientUserId !== userId) {
      throw new ForbiddenException('You cannot access this project intake.');
    }

    return intake;
  }

  async createForUser(
    dto: CreateProjectIntakeDto,
    user: { id: string; email?: string },
  ) {
    return this.prisma.projectIntake.create({
      data: {
        clientUserId: user.id,
        projectName: dto.projectName.trim(),
        timeInvestment: dto.timeInvestment.trim(),
        budgetRange: dto.budgetRange.trim(),
        projectDescription: dto.projectDescription.trim(),
        goals: dto.goals.trim(),
        thumbnailUrl: dto.thumbnailUrl?.trim() || null,
        mp4Url: dto.mp4Url?.trim() || null,
      },
    });
  }

  async updateForUser(id: string, userId: string, dto: UpdateProjectIntakeDto) {
    const existing = await this.prisma.projectIntake.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Project intake not found.');
    }

    if (existing.clientUserId !== userId) {
      throw new ForbiddenException('You cannot edit this project intake.');
    }

    const data = {
      ...(dto.projectName !== undefined && {
        projectName: dto.projectName.trim(),
      }),
      ...(dto.timeInvestment !== undefined && {
        timeInvestment: dto.timeInvestment.trim(),
      }),
      ...(dto.budgetRange !== undefined && {
        budgetRange: dto.budgetRange.trim(),
      }),
      ...(dto.projectDescription !== undefined && {
        projectDescription: dto.projectDescription.trim(),
      }),
      ...(dto.goals !== undefined && {
        goals: dto.goals.trim(),
      }),
      ...(dto.thumbnailUrl !== undefined && {
        thumbnailUrl: dto.thumbnailUrl?.trim() || null,
      }),
      ...(dto.mp4Url !== undefined && {
        mp4Url: dto.mp4Url?.trim() || null,
      }),
    };

    return this.prisma.projectIntake.update({
      where: { id },
      data,
    });
  }
}
