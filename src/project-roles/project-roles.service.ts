import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectRoleDto, UpdateProjectRoleDto } from './project-roles.dto';

@Injectable()
export class ProjectRolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProject(projectId: string) {
    return this.prisma.projectRole.findMany({
      where: { projectId },
      include: {
        assignedUser: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateProjectRoleDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      select: { clientUserId: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.clientUserId !== userId) throw new ForbiddenException();

    return this.prisma.projectRole.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        skills: dto.skills,
      },
      include: {
        assignedUser: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  async update(userId: string, roleId: string, dto: UpdateProjectRoleDto) {
    const role = await this.prisma.projectRole.findUnique({
      where: { id: roleId },
      include: { project: { select: { clientUserId: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    if (role.project.clientUserId !== userId) throw new ForbiddenException();

    return this.prisma.projectRole.update({
      where: { id: roleId },
      data: dto,
      include: {
        assignedUser: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  async remove(userId: string, roleId: string) {
    const role = await this.prisma.projectRole.findUnique({
      where: { id: roleId },
      include: { project: { select: { clientUserId: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    if (role.project.clientUserId !== userId) throw new ForbiddenException();

    return this.prisma.projectRole.delete({ where: { id: roleId } });
  }
}
