import { Module } from '@nestjs/common';
import { ProjectIntakesController } from './project-intakes.controller';
import { ProjectIntakesService } from './project-intakes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { R2Module } from '../r2/r2.module';
import { StorageService } from '../r2/storage.service';

@Module({
  imports: [PrismaModule, R2Module],
  controllers: [ProjectIntakesController],
  providers: [ProjectIntakesService, StorageService],
})
export class ProjectIntakesModule {}
