/**
 * 23 System Role Codes seeded in PostgreSQL `roles`
 */
export enum SystemRoleCode {
  // Employee Roles (12)
  Cto = 'EMP_CTO',
  DirectorVp = 'EMP_DIRECTOR_VP',
  EngineeringManager = 'EMP_ENG_MANAGER',
  ProjectManager = 'EMP_PROJECT_MANAGER',
  ProductManager = 'EMP_PRODUCT_MANAGER',
  SolutionArchitect = 'EMP_SOLUTION_ARCHITECT',
  TechnicalLead = 'EMP_TECH_LEAD',
  TeamLead = 'EMP_TEAM_LEAD',
  SeniorDeveloper = 'EMP_SENIOR_DEV',
  Developer = 'EMP_DEVELOPER',
  JuniorDeveloper = 'EMP_JUNIOR_DEV',
  InternTrainee = 'EMP_INTERN',

  // HR Roles (11)
  Chro = 'HR_CHRO',
  HrManager = 'HR_MANAGER',
  HrBusinessPartner = 'HR_BUSINESS_PARTNER',
  HrOperationsManager = 'HR_OPERATIONS_MANAGER',
  TalentAcquisitionManager = 'HR_TA_MANAGER',
  PayrollManager = 'HR_PAYROLL_MANAGER',
  HrExecutive = 'HR_EXECUTIVE',
  Recruiter = 'HR_RECRUITER',
  PayrollExecutive = 'HR_PAYROLL_EXECUTIVE',
  HrAssistant = 'HR_ASSISTANT',
  RecruitmentCoordinator = 'HR_RECRUITMENT_COORDINATOR',
}

