import { Module } from '@nestjs/common';
import { ProjectIntakesController } from './project-intakes.controller';
import { ProjectIntakesService } from './project-intakes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageService } from 'src/r2/storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectIntakesController],
  providers: [ProjectIntakesService, StorageService],
})
export class ProjectIntakesModule {}
