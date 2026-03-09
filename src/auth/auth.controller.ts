import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('sync')
  @UseGuards(SupabaseAuthGuard)
  async sync(@Req() req: any) {
    const { id, email } = req.user;

    await this.prisma.user.upsert({
      where: { id },
      update: {},
      create: { id, email },
    });

    return { ok: true };
  }
}
