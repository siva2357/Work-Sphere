import { DepartmentCode, LeaveStatus } from '../enums';

export interface CreateLeaveProposalDto {
  employeeCode: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days?: number;
  reason: string;
}

export interface LeaveDecisionDto {
  managerEmployeeCode: string;
  comments?: string;
}

export interface LeaveFilterDto {
  employeeCode?: string;
  departmentCode?: DepartmentCode | string;
  status?: LeaveStatus | string;
}

