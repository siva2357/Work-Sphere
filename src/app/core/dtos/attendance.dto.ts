import { DepartmentCode, WorkMode } from '../enums';

export interface MarkAttendanceRequestDto {
  employeeCode: string;
  action: 'PUNCH_IN' | 'PUNCH_OUT' | string;
  time?: string;
  location: string;
  workMode: WorkMode | string;
  remarks?: string;
}

export interface BatchAttendanceReminderDto {
  employeeCodes: string[];
  sentByManagerCode?: string;
}

export interface AttendanceFilterDto {
  employeeCode?: string;
  managerCode?: string;
  departmentCode?: DepartmentCode | string;
}

