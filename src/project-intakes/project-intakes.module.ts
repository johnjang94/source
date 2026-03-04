import { Module } from '@nestjs/common';
import { ProjectIntakesController } from './project-intakes.controller';
import { ProjectIntakesService } from './project-intakes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectIntakesController],
  providers: [ProjectIntakesService],
})
export class ProjectIntakesModule {}
