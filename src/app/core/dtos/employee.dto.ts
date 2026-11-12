import {
  DepartmentCode,
  DesignationCode,
  EmployeeWorkStatus,
  EmploymentType,
  SystemRoleCode,
  WorkMode,
} from '../enums';

export interface MainHrCreateEmployeeDto {
  createdByHrEmailOrCode?: string;
  fullName: string;
  email: string;
  initialPassword?: string;
  phone?: string;
  departmentCode: DepartmentCode | string;
  designationCode?: DesignationCode | string;
  roleCode?: SystemRoleCode | string;
  employmentType?: EmploymentType | string;
  workLocation?: string;
  managerEmployeeCode?: string;
}

export interface ExternalCompanyRegistrationDto {
  name: string;
  domain: string;
  industry: string;
  companySize: string;
  headquarters: string;
  subscriptionPlan: string;
  mainHrFullName: string;
  mainHrEmail: string;
  mainHrPassword?: string;
  mainHrPhone?: string;
}

export interface EmployeeDirectoryFilterDto {
  companyCode?: string;
  departmentCode?: DepartmentCode | string;
  status?: EmployeeWorkStatus | string;
  searchQuery?: string;
}

export interface TeamAllocationRequestDto {
  employeeIds: string[];
  targetDepartment: string;
  targetTeamPod: string;
  teamId: string;
  teamLeadAssigned: string;
  startDate: string;
  endDate: string;
  assignedProjects: string;
  workMode: WorkMode | string;
  allocationPercentage: number;
}

