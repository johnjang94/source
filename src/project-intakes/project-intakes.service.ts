import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectIntakeDto } from './dto/create-project-intake.dto';
import { UpdateProjectIntakeDto } from './dto/update-project-intake.dto';
import { StorageService } from 'src/r2/storage.service';

@Injectable()
export class ProjectIntakesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

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

  async createForUser(dto: CreateProjectIntakeDto, userId: string) {
    return this.prisma.projectIntake.create({
      data: {
        clientUserId: userId,
        projectName: dto.projectName,
        budgetRange: dto.budgetRange,
        timeInvestment: dto.timeInvestment,
        projectDescription: dto.projectDescription,
        goals: dto.goals,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        mp4Url: dto.mp4Url ?? null,
        status: dto.status ?? 'submitted',
      },
    });
  }

  async updateForUser(id: string, dto: UpdateProjectIntakeDto, userId: string) {
    const intake = await this.findByIdForUser(id, userId);

    return this.prisma.projectIntake.update({
      where: { id: intake.id },
      data: {
        ...(dto.projectName !== undefined && { projectName: dto.projectName }),
        ...(dto.budgetRange !== undefined && { budgetRange: dto.budgetRange }),
        ...(dto.timeInvestment !== undefined && {
          timeInvestment: dto.timeInvestment,
        }),
        ...(dto.projectDescription !== undefined && {
          projectDescription: dto.projectDescription,
        }),
        ...(dto.goals !== undefined && { goals: dto.goals }),
        ...(dto.thumbnailUrl !== undefined && {
          thumbnailUrl: dto.thumbnailUrl,
        }),
        ...(dto.mp4Url !== undefined && { mp4Url: dto.mp4Url }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async deleteForUser(id: string, userId: string) {
    const intake = await this.prisma.projectIntake.findUnique({
      where: { id },
    });

    if (!intake) {
      throw new NotFoundException('Project intake not found.');
    }

    if (intake.clientUserId !== userId) {
      throw new ForbiddenException('You cannot delete this project intake.');
    }

    if (intake.thumbnailUrl) {
      await this.storageService.deleteByUrl(intake.thumbnailUrl);
    }

    if (intake.mp4Url) {
      await this.storageService.deleteByUrl(intake.mp4Url);
    }

    await this.prisma.projectIntake.delete({
      where: { id: intake.id },
    });

    return { ok: true };
  }
}
