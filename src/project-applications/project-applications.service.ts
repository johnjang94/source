import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectApplicationDto } from './dto/create-project-application.dto';

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

      await tx.notification.create({
        data: {
          recipientId: project.clientUserId,
          senderId: userId,
          projectId: dto.projectId,
          type: 'application',
          title: 'New Application',
          message: `${dto.firstName} ${dto.lastName} applied to ${project.projectName}`,
          isRead: false,
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
        project: {
          include: {
            clientUser: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    return applications.map((app) => app.project);
  }

  async listByProject(projectId: string) {
    const applications = await this.prisma.projectApplication.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        form: true,
        user: true,
      },
    });

    return applications.map((app) => ({
      id: app.id,
      firstName: app.form?.firstName ?? '',
      lastName: app.form?.lastName ?? '',
      position: app.form?.position ?? '',
      resumeR2Key: app.form?.resumeR2Key ?? null,
      portfolioLink: app.form?.portfolioLink ?? null,
      avatarUrl: app.user?.avatarUrl ?? null,
      createdAt: app.createdAt,
    }));
  }
}
