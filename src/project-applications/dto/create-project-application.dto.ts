import { IsString } from 'class-validator';

export class CreateProjectApplicationDto {
  @IsString()
  projectId: string;
}
