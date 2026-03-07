import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsModule } from './uploads/uploads.module';
import { ProjectIntakesModule } from './project-intakes/project-intakes.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UploadsModule,
    ProjectIntakesModule,
    ProjectsModule,
  ],
})
export class AppModule {}
