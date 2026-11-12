import { DepartmentCode, PriorityLevel, TaskStatus } from '../enums';

export interface CreateTaskRequestDto {
  title: string;
  description: string;
  projectCode?: string;
  projectName?: string;
  assigneeEmployeeCode: string;
  assignedByEmployeeCode?: string;
  dueDate?: string;
  priority: PriorityLevel | string;
  estimatedHours: number;
  category: string;
  subtasks?: string[];
}

export interface UpdateTaskStatusRequestDto {
  status: TaskStatus | string;
  progressPercent?: number;
  loggedHours?: number;
}

export interface TaskFilterDto {
  assigneeCode?: string;
  assignedByCode?: string;
  departmentCode?: DepartmentCode | string;
  projectCode?: string;
  status?: TaskStatus | string;
}

