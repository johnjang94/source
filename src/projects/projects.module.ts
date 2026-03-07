import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
