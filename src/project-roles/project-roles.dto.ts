export class CreateProjectRoleDto {
  projectId: string;
  title: string;
  skills: string[];
}

export class UpdateProjectRoleDto {
  title?: string;
  skills?: string[];
  status?: string;
  assignedUserId?: string | null;
  candidateCount?: number;
}
