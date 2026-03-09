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
    userId: string,
    email: string,
    dto: CreateProjectIntakeDto,
  ) {
    await this.prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email },
      update: {},
    });

    return this.prisma.$transaction(async (tx) => {
      const intake = await tx.projectIntake.create({
        data: {
          clientUserId: userId,
          projectName: dto.projectName,
          budgetRange: dto.budgetRange,
          timeInvestment: dto.timeInvestment,
          projectDescription: dto.projectDescription,
          goals: dto.goals,
          thumbnailUrl: dto.thumbnailUrl ?? null,
          mp4Url: dto.mp4Url ?? null,
          status: 'submitted',
        },
      });

      await tx.project.create({
        data: {
          intakeId: intake.id,
          clientUserId: userId,
          projectName: dto.projectName,
          budgetRange: dto.budgetRange,
          timeInvestment: dto.timeInvestment,
          projectDescription: dto.projectDescription,
          goals: dto.goals,
          thumbnailUrl: dto.thumbnailUrl ?? null,
          mp4Url: dto.mp4Url ?? null,
          status: 'open',
        },
      });

      return intake;
    });
  }

  async updateForUser(id: string, userId: string, dto: UpdateProjectIntakeDto) {
    const intake = await this.prisma.projectIntake.findUnique({
      where: { id },
    });

    if (!intake) {
      throw new NotFoundException('Project intake not found.');
    }

    if (intake.clientUserId !== userId) {
      throw new ForbiddenException('You cannot update this project intake.');
    }

    return this.prisma.projectIntake.update({
      where: { id },
      data: {
        ...(dto.projectName !== undefined
          ? { projectName: dto.projectName }
          : {}),
        ...(dto.budgetRange !== undefined
          ? { budgetRange: dto.budgetRange }
          : {}),
        ...(dto.timeInvestment !== undefined
          ? { timeInvestment: dto.timeInvestment }
          : {}),
        ...(dto.projectDescription !== undefined
          ? { projectDescription: dto.projectDescription }
          : {}),
        ...(dto.goals !== undefined ? { goals: dto.goals } : {}),
        ...(dto.thumbnailUrl !== undefined
          ? { thumbnailUrl: dto.thumbnailUrl }
          : {}),
        ...(dto.mp4Url !== undefined ? { mp4Url: dto.mp4Url } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async deleteForUser(id: string, userId: string) {
    const intake = await this.prisma.projectIntake.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!intake) {
      throw new NotFoundException('Project intake not found.');
    }

    if (intake.clientUserId !== userId) {
      throw new ForbiddenException('You cannot delete this project intake.');
    }

    return this.prisma.$transaction(async (tx) => {
      if (intake.project) {
        await tx.projectApplication.deleteMany({
          where: {
            projectId: intake.project.id,
          },
        });

        await tx.project.delete({
          where: {
            id: intake.project.id,
          },
        });
      }

      return tx.projectIntake.delete({
        where: { id },
      });
    });
  }
}
