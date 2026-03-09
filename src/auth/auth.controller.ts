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
      companyName?: string;
      avatarUrl?: string | null;
      companyLogoUrl?: string | null;
    },
  ) {
    const { id, email } = req.user;

    await this.prisma.user.upsert({
      where: { id },
      update: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.companyName !== undefined && {
          companyName: body.companyName,
        }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
        ...(body.companyLogoUrl !== undefined && {
          companyLogoUrl: body.companyLogoUrl,
        }),
      },
      create: {
        id,
        email,
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        companyName: body.companyName ?? null,
        avatarUrl: body.avatarUrl ?? null,
        companyLogoUrl: body.companyLogoUrl ?? null,
      },
    });

    return { ok: true };
  }
}
