import { DepartmentCode, PriorityLevel, ProjectStatus } from '../enums';

export interface CreateProjectRequestDto {
  name: string;
  code?: string;
  description: string;
  departmentCode?: DepartmentCode | string;
  leadEmployeeCode?: string;
  teamMemberCodes: string[];
  category: string;
  priority: PriorityLevel | string;
  status: ProjectStatus | string;
  budget: string;
  methodology: string;
  milestones?: string[];
  externalToolUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectFilterDto {
  departmentCode?: DepartmentCode | string;
  memberCode?: string;
  status?: ProjectStatus | string;
}

