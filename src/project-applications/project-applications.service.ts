import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectApplicationDto } from './dto/create-project-application.dto';

const HR_POSITIONS = [
  'HR Manager',
  'Recruiter',
  'Human Resources Specialist',
  'Talent Acquisition',
  'HR Coordinator',
  'People Operations',
];

@Injectable()
export class ProjectApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: CreateProjectApplicationDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

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

    return this.prisma.$transaction(async (tx) => {
      const application = await tx.projectApplication.create({
        data: {
          projectId: dto.projectId,
          userId,
        },
      });

      const position = project.position ?? 'Project Coordinator';

      await tx.applicationForm.create({
        data: {
          applicationId: application.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          position,
          resumeR2Key: dto.resumeR2Key,
          portfolioLink: dto.portfolioLink ?? null,
        },
      });

      return { ok: true, applicationId: application.id, position };
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
