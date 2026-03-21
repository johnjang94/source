import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

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

  async getCompanyByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        company: {
          select: {
            name: true,
            industry: true,
            serviceDescription: true,
            logoUrl: true,
          },
        },
      },
    });
    return user?.company ?? null;
  }

  async getResumeForProject(projectId: string, participantId: string) {
    const application = await this.prisma.projectApplication.findFirst({
      where: { projectId, userId: participantId },
      include: {
        form: { select: { resumeR2Key: true, portfolioLink: true } },
      },
    });
    if (!application?.form) return null;
    const baseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? '';
    return {
      resumeUrl: `${baseUrl}/${application.form.resumeR2Key}`,
      portfolioLink: application.form.portfolioLink,
    };
  }

  async getResumeExperience(
    projectId: string,
    participantId: string,
  ): Promise<{ experience: string | null }> {
    const application = await this.prisma.projectApplication.findFirst({
      where: { projectId, userId: participantId },
      include: { form: { select: { resumeR2Key: true } } },
    });

    if (!application?.form?.resumeR2Key) return { experience: null };

    const r2Key = application.form.resumeR2Key;
    const ext = r2Key.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') return { experience: null };

    const command = new GetObjectCommand({
      Bucket: this.r2.getBucketName(),
      Key: r2Key,
    });
    const response = await this.r2.getClient().send(command);

    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    let fullText = '';
    if (ext === 'pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (
        buf: Buffer,
      ) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      fullText = data.text;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth') as {
        extractRawText: (opts: {
          buffer: Buffer;
        }) => Promise<{ value: string }>;
      };
      const result = await mammoth.extractRawText({ buffer });
      fullText = result.value;
    }

    const experience = extractExperienceSection(fullText);
    return { experience };
  }

  async deleteMine(id: string, userId: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });

    if (!existing) throw new NotFoundException('Project not found.');
    if (existing.clientUserId !== userId)
      throw new ForbiddenException('You cannot delete this project.');

    return this.prisma.project.delete({ where: { id } });
  }
}

function extractExperienceSection(text: string): string | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const experienceHeader =
    /^(work\s+)?experience|employment(\s+history)?|professional\s+experience|work\s+history|career(\s+history)?$/i;
  const nextSectionHeader =
    /^(education|skills|summary|objective|certifications?|projects?|references?|languages?|awards?|publications?|volunteer|interests?|hobbies|training|courses?)$/i;

  let inExperience = false;
  const collected: string[] = [];

  for (const line of lines) {
    if (!inExperience && experienceHeader.test(line)) {
      inExperience = true;
      continue;
    }
    if (inExperience) {
      if (nextSectionHeader.test(line)) break;
      collected.push(line);
      if (collected.length >= 25) break;
    }
  }

  if (collected.length === 0) return null;
  return collected.join('\n');
}
