import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProjectDto } from './update-project.dto';
import { UpdateProjectBriefDto } from './update-project-brief.dto';

const clientUserSelect = {
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
    company: {
      select: {
        name: true,
        industry: true,
        serviceDescription: true,
        logoUrl: true,
      },
    },
  },
};

const projectPublicSelect = {
  id: true,
  projectName: true,
  projectDescription: true,
  expectedOutcome: true,
  budgetAllowance: true,
  projectDeadline: true,
  thumbnailUrl: true,
  videoUrl: true,
  submissionType: true,
  status: true,
  createdAt: true,
  // Brief fields
  targetAudience: true,
  projectStage: true,
  aiInvolvement: true,
  currentFrustrations: true,
  triedSolutions: true,
  desiredFeatures: true,
  successMetrics: true,
  kpis: true,
  technicalConstraints: true,
  stakeholders: true,
  dependencies: true,
  regulatoryRequirements: true,
  clientUser: clientUserSelect,
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string) {
    return this.prisma.project.findMany({
      where: { clientUserId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublic(userId?: string) {
    let excludedProjectIds: string[] = [];

    if (userId) {
      const applications = await this.prisma.projectApplication.findMany({
        where: { userId },
        select: { projectId: true },
      });
      excludedProjectIds = applications.map((item) => item.projectId);
    }

    return this.prisma.project.findMany({
      where: {
        ...(excludedProjectIds.length > 0 && {
          id: { notIn: excludedProjectIds },
        }),
      },
      orderBy: { createdAt: 'desc' },
      select: projectPublicSelect,
    });
  }

  async findPublicById(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id },
      select: projectPublicSelect,
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  async findParticipantList(userId: string) {
    const applications = await this.prisma.projectApplication.findMany({
      where: { userId },
      select: { projectId: true },
      orderBy: { createdAt: 'desc' },
    });

    const projectIds = applications.map((item) => item.projectId);

    if (projectIds.length === 0) return [];

    return this.prisma.project.findMany({
      where: { id: { in: projectIds } },
      orderBy: { createdAt: 'desc' },
      select: projectPublicSelect,
    });
  }

  async findParticipantListById(id: string, userId: string) {
    const application = await this.prisma.projectApplication.findFirst({
      where: { projectId: id, userId },
    });

    if (!application) {
      throw new NotFoundException('Applied project not found.');
    }

    const project = await this.prisma.project.findFirst({
      where: { id },
      select: projectPublicSelect,
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  async updateMine(id: string, userId: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({ where: { id } });

    if (!existing) throw new NotFoundException('Project not found.');
    if (existing.clientUserId !== userId)
      throw new ForbiddenException('You cannot edit this project.');

    const normalizedData = {
      ...(dto.projectName !== undefined && {
        projectName: dto.projectName.trim(),
      }),
      ...(dto.projectDescription !== undefined && {
        projectDescription: dto.projectDescription.trim(),
      }),
      ...(dto.expectedOutcome !== undefined && {
        expectedOutcome: dto.expectedOutcome.trim(),
      }),
      ...(dto.budgetAllowance !== undefined && {
        budgetAllowance: dto.budgetAllowance.trim(),
      }),
      ...(dto.projectDeadline !== undefined && {
        projectDeadline: new Date(dto.projectDeadline),
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

  async updateStatus(id: string, userId: string, status: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });

    if (!existing) throw new NotFoundException('Project not found.');
    if (existing.clientUserId !== userId)
      throw new ForbiddenException('You cannot update this project.');

    return this.prisma.project.update({
      where: { id },
      data: { status },
    });
  }

  async updateStatusInternal(id: string, status: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found.');
    return this.prisma.project.update({
      where: { id },
      data: { status },
    });
  }

  // Participant가 brief 필드를 업데이트 (applicant로 승인된 유저만)
  async updateBrief(
    projectId: string,
    userId: string,
    dto: UpdateProjectBriefDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found.');

    // 해당 프로젝트에 지원한 participant인지 확인
    const application = await this.prisma.projectApplication.findFirst({
      where: { projectId, userId },
    });
    if (!application)
      throw new ForbiddenException(
        'You are not an approved participant for this project.',
      );

    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        data[key] =
          key === 'projectDeadline' ? new Date(value as string) : value;
      }
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data,
      select: projectPublicSelect,
    });
  }

  async deleteMine(id: string, userId: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });

    if (!existing) throw new NotFoundException('Project not found.');
    if (existing.clientUserId !== userId)
      throw new ForbiddenException('You cannot delete this project.');

    return this.prisma.project.delete({ where: { id } });
  }
}
