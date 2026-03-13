import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEarlyAccessDto } from './dto/create-early-access.dto';

@Injectable()
export class EarlyAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEarlyAccessDto) {
    const existing = await this.prisma.earlyAccess.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('This email has already been registered.');
    }

    return this.prisma.earlyAccess.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        role: dto.role,
        portfolio: dto.portfolio ?? null,
        reason: dto.reason ?? null,
      },
    });
  }
}
