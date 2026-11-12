import { DepartmentCode, DesignationCode } from '../enums';

export interface CreateJobOpeningDto {
  title: string;
  departmentCode: DepartmentCode | string;
  designationCode?: DesignationCode | string;
  employmentType: string;
  location: string;
  openingsCount: number;
  salaryRange?: string;
  experienceRequired?: string;
  description?: string;
}

export interface ExternalCandidateApplicationDto {
  jobCode: string;
  fullName: string;
  email: string;
  phone?: string;
  experience?: string;
  resumeUrl?: string;
}

export interface EvaluateRecruitmentPhaseDto {
  phaseNumber: number;
  evaluatorEmployeeId?: string;
  score?: number;
  rating?: number;
  passed: boolean;
  feedback?: string;
  nextPhaseMeetingLink?: string;
  nextPhaseEvaluatorId?: string;
  offeredCtc?: string;
}

export interface OnboardCandidateRequestDto {
  workEmail: string;
  temporaryPassword: string;
  reportingManagerEmployeeId?: string;
}

