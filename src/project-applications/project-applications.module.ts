import { Module } from '@nestjs/common';
import { ProjectApplicationsService } from './project-applications.service';
import { ProjectApplicationsController } from './project-applications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ProjectApplicationsController],
  providers: [ProjectApplicationsService],
})
export class ProjectApplicationsModule {}
