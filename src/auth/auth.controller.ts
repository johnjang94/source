import { Controller, Post, Req, UseGuards, Body } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('sync')
  @UseGuards(SupabaseAuthGuard)
  async sync(
    @Req() req: any,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string | null;
      companyName?: string;
      industry?: string;
      registeredNumber?: string;
      serviceDescription?: string;
      companyLogoUrl?: string | null;
    },
  ) {
    const { id, email } = req.user;

    await this.prisma.user.upsert({
      where: { id },
      update: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      },
      create: {
        id,
        email,
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        avatarUrl: body.avatarUrl ?? null,
      },
    });

    if (body.companyName) {
      await this.prisma.company.upsert({
        where: { userId: id },
        update: {
          ...(body.companyName !== undefined && { name: body.companyName }),
          ...(body.industry !== undefined && { industry: body.industry }),
          ...(body.registeredNumber !== undefined && {
            registeredNumber: body.registeredNumber,
          }),
          ...(body.serviceDescription !== undefined && {
            serviceDescription: body.serviceDescription,
          }),
          ...(body.companyLogoUrl !== undefined && {
            logoUrl: body.companyLogoUrl,
          }),
        },
        create: {
          userId: id,
          name: body.companyName,
          industry: body.industry ?? null,
          registeredNumber: body.registeredNumber ?? null,
          serviceDescription: body.serviceDescription ?? null,
          logoUrl: body.companyLogoUrl ?? null,
        },
      });
    }

    return { ok: true };
  }
}
