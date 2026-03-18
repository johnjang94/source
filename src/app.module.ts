import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsModule } from './uploads/uploads.module';
import { ProjectIntakesModule } from './project-intakes/project-intakes.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectApplicationsModule } from './project-applications/project-applications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EarlyAccessModule } from './early-access/early-access-module';
import { ChatModule } from './chat/chat.module';
import { VideoModule } from './video/video.module';
import { AgreementsModule } from './agreements/agreements.module';
import { ProjectRolesModule } from './project-roles/project-roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UploadsModule,
    ProjectIntakesModule,
    ProjectsModule,
    AuthModule,
    ProjectApplicationsModule,
    NotificationsModule,
    EarlyAccessModule,
    ChatModule,
    VideoModule,
    AgreementsModule,
    ProjectRolesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
