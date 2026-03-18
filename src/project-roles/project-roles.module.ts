import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectRolesController } from './project-roles.controller';
import { ProjectRolesService } from './project-roles.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectRolesController],
  providers: [ProjectRolesService],
  exports: [ProjectRolesService],
})
export class ProjectRolesModule {}
