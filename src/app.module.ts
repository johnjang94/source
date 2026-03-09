import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsModule } from './uploads/uploads.module';
import { ProjectIntakesModule } from './project-intakes/project-intakes.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectApplicationsModule } from './project-applications/project-applications.module';

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
  ],
  controllers: [HealthController],
})
export class AppModule {}
