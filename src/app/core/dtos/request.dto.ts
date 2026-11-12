import { DesignationCode, PriorityLevel } from '../enums';

export interface CreateEmployeeRequestDto {
  employeeId?: string;
  employeeCode?: string;
  category: string;
  subject: string;
  description: string;
  priority?: PriorityLevel | string;

  // Optional Leave fields
  leaveType?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  leaveDays?: number;

  // Optional Promotion field
  requestedDesignationCode?: DesignationCode | string;

  // Optional Hike / Salary Review fields
  currentCtc?: string;
  requestedCtc?: string;
  requestedHikePercentage?: number;

  // Optional Resignation fields
  proposedLastWorkingDay?: string;
  noticePeriodDays?: number;
}

export interface RequestDecisionDto {
  approverEmployeeId?: string;
  approverEmployeeCode?: string;
  remarks?: string;
}

export interface RequestFilterDto {
  category?: string;
  status?: string;
  employeeId?: string;
}

