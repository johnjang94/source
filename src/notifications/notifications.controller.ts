import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';

@UseGuards(SupabaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@AuthUser() user: { id: string }) {
    return this.notificationsService.getNotifications(user.id);
  }

  @Patch('mark-read')
  async markRead(
    @AuthUser() user: { id: string },
    @Body() body: { ids: string[] },
  ) {
    return this.notificationsService.markRead(user.id, body.ids);
  }
}
