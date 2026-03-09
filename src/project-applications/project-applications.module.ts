import { Module } from '@nestjs/common';
import { ProjectApplicationsService } from './project-applications.service';
import { ProjectApplicationsController } from './project-applications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectApplicationsController],
  providers: [ProjectApplicationsService],
})
export class ProjectApplicationsModule {}
