import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectApplicationDto } from './dto/create-project-application.dto';

@Injectable()
export class ProjectApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: CreateProjectApplicationDto) {
    const existing = await this.prisma.projectApplication.findUnique({
      where: {
        projectId_userId: {
          projectId: dto.projectId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Already applied to this project.');
    }

    return this.prisma.projectApplication.create({
      data: {
        projectId: dto.projectId,
        userId,
      },
    });
  }

  async listByUser(userId: string) {
    const applications = await this.prisma.projectApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
      },
    });

    return applications.map((app) => app.project);
  }
}
