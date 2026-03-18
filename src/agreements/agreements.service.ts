import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { ChatGateway } from '../chat/chat.gateway';

const AGREEMENT_TYPES = ['nda', 'project', 'deposit', 'privacy'];

@Injectable()
export class AgreementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async sign(userId: string, dto: { projectId: string; agreementType: string; signatureData: string }) {
    const agreement = await this.prisma.signedAgreement.upsert({
      where: {
        projectId_userId_agreementType: {
          projectId: dto.projectId,
          userId,
          agreementType: dto.agreementType,
        },
      },
      update: {
        signatureData: dto.signatureData,
        signedAt: new Date(),
      },
      create: {
        projectId: dto.projectId,
        userId,
        agreementType: dto.agreementType,
        signatureData: dto.signatureData,
      },
    });

    // Check if all agreements are signed by both parties
    const allSigned = await this.checkAllSigned(dto.projectId);

    return { agreement, allSigned };
  }

  async checkAllSigned(projectId: string): Promise<boolean> {
    const agreements = await this.prisma.signedAgreement.findMany({
      where: { projectId },
    });

    // Get the two parties: client + applicant
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { clientUserId: true, projectName: true },
    });
    if (!project) return false;

    const chatRoom = await this.prisma.chatRoom.findFirst({
      where: { projectId },
    });
    if (!chatRoom) return false;

    const requiredUsers = [project.clientUserId, chatRoom.applicantId];
    const signedMap = new Map<string, Set<string>>();
    for (const a of agreements) {
      if (!signedMap.has(a.userId)) signedMap.set(a.userId, new Set());
      signedMap.get(a.userId)!.add(a.agreementType);
    }

    const allComplete = requiredUsers.every((uid) => {
      const types = signedMap.get(uid);
      return types && AGREEMENT_TYPES.every((t) => types.has(t));
    });

    if (allComplete) {
      // Update project status to "approved"
      try {
        const currentProject = await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { status: true },
        });
        if (currentProject && currentProject.status !== 'approved') {
          await this.projectsService.updateStatusInternal(projectId, 'approved');
        }
      } catch (err) {
        console.error('[Agreements] status update error:', err);
      }

      // Send agreement summary message to chat
      try {
        const existingSummary = await this.prisma.message.findFirst({
          where: { chatRoomId: chatRoom.id, type: 'agreement_summary' },
        });
        if (!existingSummary) {
          const summaryMessage = await this.prisma.message.create({
            data: {
              chatRoomId: chatRoom.id,
              senderId: 'system',
              content: 'All agreements have been signed by both parties.',
              type: 'agreement_summary',
              metadata: {
                projectId,
                projectName: project.projectName,
                agreements: agreements.map((a) => ({
                  agreementType: a.agreementType,
                  userId: a.userId,
                  signedAt: a.signedAt,
                })),
              },
            },
          });
          this.chatGateway.emitMessage(chatRoom.id, summaryMessage);
        }
      } catch (err) {
        console.error('[Agreements] chat summary error:', err);
      }
    }

    return allComplete;
  }

  async getByProject(projectId: string) {
    return this.prisma.signedAgreement.findMany({
      where: { projectId },
      orderBy: { signedAt: 'asc' },
    });
  }

  async getByUser(userId: string) {
    return this.prisma.signedAgreement.findMany({
      where: { userId },
      orderBy: { signedAt: 'desc' },
      include: {
        project: {
          select: { id: true, projectName: true },
        },
      },
    });
  }
}
