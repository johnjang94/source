import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProjectDto } from './update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string) {
    return this.prisma.project.findMany({
      where: {
        clientUserId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPublic() {
    return this.prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        projectName: true,
        budgetRange: true,
        timeInvestment: true,
        projectDescription: true,
        goals: true,
        thumbnailUrl: true,
        mp4Url: true,
        createdAt: true,
        status: true,
        client: {
          select: {
            companyName: true,
            avatarUrl: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findPublicById(id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        projectName: true,
        budgetRange: true,
        timeInvestment: true,
        projectDescription: true,
        goals: true,
        thumbnailUrl: true,
        mp4Url: true,
        createdAt: true,
        status: true,
        client: {
          select: {
            companyName: true,
            avatarUrl: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  async findParticipantList() {
    return this.prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        projectName: true,
        budgetRange: true,
        timeInvestment: true,
        projectDescription: true,
        goals: true,
        thumbnailUrl: true,
        mp4Url: true,
        createdAt: true,
        status: true,
        client: {
          select: {
            companyName: true,
            avatarUrl: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findParticipantListById(id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        projectName: true,
        budgetRange: true,
        timeInvestment: true,
        projectDescription: true,
        goals: true,
        thumbnailUrl: true,
        mp4Url: true,
        createdAt: true,
        status: true,
        client: {
          select: {
            companyName: true,
            avatarUrl: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  async updateMine(id: string, userId: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Project not found.');
    }

    if (existing.clientUserId !== userId) {
      throw new ForbiddenException('You cannot edit this project.');
    }

    const normalizedData = {
      ...(dto.projectName !== undefined && {
        projectName: dto.projectName.trim(),
      }),
      ...(dto.budgetRange !== undefined && {
        budgetRange: dto.budgetRange.trim(),
      }),
      ...(dto.timeInvestment !== undefined && {
        timeInvestment: dto.timeInvestment.trim(),
      }),
      ...(dto.projectDescription !== undefined && {
        projectDescription: dto.projectDescription.trim(),
      }),
      ...(dto.goals !== undefined && {
        goals: dto.goals.trim(),
      }),
      ...(dto.thumbnailUrl !== undefined && {
        thumbnailUrl: dto.thumbnailUrl,
      }),
    };

    return this.prisma.project.update({
      where: { id },
      data: normalizedData,
    });
  }

  async deleteMine(id: string, userId: string) {
    const existing = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Project not found.');
    }

    if (existing.clientUserId !== userId) {
      throw new ForbiddenException('You cannot delete this project.');
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }
}
