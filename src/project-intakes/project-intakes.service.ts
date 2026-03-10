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
          projectDescription: dto.projectDescription,
          expectedOutcome: dto.expectedOutcome,
          budgetAllowance: dto.budgetAllowance,
          projectDeadline: new Date(dto.projectDeadline),
          thumbnailUrl: dto.thumbnailUrl ?? null,
          videoUrl: dto.videoUrl ?? null,
          submissionType: dto.submissionType ?? 'guided',
          status: 'submitted',
        },
      });

      await tx.project.create({
        data: {
          intakeId: intake.id,
          clientUserId: userId,
          projectName: dto.projectName,
          projectDescription: dto.projectDescription,
          expectedOutcome: dto.expectedOutcome,
          budgetAllowance: dto.budgetAllowance,
          projectDeadline: new Date(dto.projectDeadline),
          thumbnailUrl: dto.thumbnailUrl ?? null,
          videoUrl: dto.videoUrl ?? null,
          submissionType: dto.submissionType ?? 'guided',
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
        ...(dto.projectName !== undefined && { projectName: dto.projectName }),
        ...(dto.projectDescription !== undefined && {
          projectDescription: dto.projectDescription,
        }),
        ...(dto.expectedOutcome !== undefined && {
          expectedOutcome: dto.expectedOutcome,
        }),
        ...(dto.budgetAllowance !== undefined && {
          budgetAllowance: dto.budgetAllowance,
        }),
        ...(dto.projectDeadline !== undefined && {
          projectDeadline: new Date(dto.projectDeadline),
        }),
        ...(dto.thumbnailUrl !== undefined && {
          thumbnailUrl: dto.thumbnailUrl,
        }),
        ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
        ...(dto.submissionType !== undefined && {
          submissionType: dto.submissionType,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
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
