import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from 'src/r2/storage.service';
import { CreateProjectIntakeDto } from './dto/create-project-intake.dto';
import { UpdateProjectIntakeDto } from './dto/update-project-intake.dto';

@Injectable()
export class ProjectIntakesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async listByUser(userId: string) {
    return this.prisma.projectIntake.findMany({
      where: { clientUserId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdForUser(id: string, userId: string) {
    const intake = await this.prisma.projectIntake.findUnique({
      where: { id },
    });

    if (!intake) throw new NotFoundException('Project intake not found.');
    if (intake.clientUserId !== userId) throw new ForbiddenException();

    return intake;
  }

  async createForUser(userId: string, dto: CreateProjectIntakeDto) {
    return this.prisma.$transaction(async (tx) => {
      const intake = await tx.projectIntake.create({
        data: {
          clientUserId: userId,
          projectName: dto.projectName,
          projectDescription: dto.projectDescription,
          expectedOutcome: dto.expectedOutcome,
          budgetAllowance: String(dto.estimatedBudget),
          projectDeadline: new Date(dto.projectDeadline),
          thumbnailUrl: dto.thumbnailUrl ?? null,
          videoUrl: dto.videoUrl ?? null,
          submissionType: dto.submissionType ?? 'guided',
          status: dto.status ?? 'submitted',
        },
      });

      await tx.project.create({
        data: {
          intakeId: intake.id,
          clientUserId: userId,
          projectName: intake.projectName,
          projectDescription: intake.projectDescription,
          expectedOutcome: intake.expectedOutcome,
          budgetAllowance: intake.budgetAllowance,
          projectDeadline: intake.projectDeadline,
          thumbnailUrl: intake.thumbnailUrl,
          videoUrl: intake.videoUrl,
          submissionType: intake.submissionType,
          status: intake.status,
        },
      });

      return intake;
    });
  }

  async updateForUser(id: string, userId: string, dto: UpdateProjectIntakeDto) {
    const intake = await this.prisma.projectIntake.findUnique({
      where: { id },
    });

    if (!intake) throw new NotFoundException('Project intake not found.');
    if (intake.clientUserId !== userId) throw new ForbiddenException();

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
        ...(dto.estimatedBudget !== undefined && {
          budgetAllowance: String(dto.estimatedBudget),
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
    });

    if (!intake) throw new NotFoundException('Project intake not found.');
    if (intake.clientUserId !== userId) throw new ForbiddenException();

    await this.storage.deleteByUrl(intake.thumbnailUrl);
    await this.storage.deleteByUrl(intake.videoUrl);

    return this.prisma.projectIntake.delete({ where: { id } });
  }
}
