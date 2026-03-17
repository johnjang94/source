import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async me(@Req() req: any) {
    const { email } = req.user;
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });
    return user;
  }

  @Get('check-username')
  @UseGuards(SupabaseAuthGuard)
  async checkUsername(@Query('username') username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return { taken: !!user };
  }

  @Post('sync')
  @UseGuards(SupabaseAuthGuard)
  async sync(
    @Req() req: any,
    @Body()
    body: {
      username?: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string | null;
      role?: string;
      companyName?: string;
      industry?: string;
      registeredNumber?: string;
      serviceDescription?: string;
      companyLogoUrl?: string | null;
    },
  ) {
    const { id, email } = req.user;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      await this.prisma.user.update({
        where: { email },
        data: {
          ...(body.username !== undefined && { username: body.username }),
          ...(body.firstName !== undefined && { firstName: body.firstName }),
          ...(body.lastName !== undefined && { lastName: body.lastName }),
          ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
          ...(body.role !== undefined && { role: body.role }),
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          id,
          email,
          username: body.username ?? null,
          firstName: body.firstName ?? null,
          lastName: body.lastName ?? null,
          avatarUrl: body.avatarUrl ?? null,
          role: body.role ?? null,
        },
      });
    }
    if (body.companyName) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      await this.prisma.company.upsert({
        where: { userId: user!.id },
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
          userId: user!.id,
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

  @Patch('status')
  @UseGuards(SupabaseAuthGuard)
  async updateStatus(
    @Req() req: any,
    @Body() body: { status: string },
  ) {
    const { email } = req.user;
    const validStatuses = ['online', 'busy', 'dnd', 'offline'];
    const status = validStatuses.includes(body.status) ? body.status : 'online';

    const user = await this.prisma.user.update({
      where: { email },
      data: { status },
    });

    this.notificationsGateway.emitStatusChange(user.id, status);

    return { id: user.id, status: user.status };
  }

  @Get('status/:userId')
  @UseGuards(SupabaseAuthGuard)
  async getUserStatus(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });
    return user ?? { id: userId, status: 'offline' };
  }
}
