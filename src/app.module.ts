import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectIntakesModule } from './project-intakes/project-intakes.module';

@Module({
  imports: [PrismaModule, ProjectIntakesModule],
})
export class AppModule {}
