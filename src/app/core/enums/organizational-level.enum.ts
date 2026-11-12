/**
 * Portal Access Track ('hr' | 'employee')
 */
export enum PortalType {
  Hr = 'hr',
  Employee = 'employee',
}

/**
 * Organizational Hierarchy Track ('Employee' | 'HR')
 */
export enum HierarchyTrack {
  Employee = 'Employee',
  Hr = 'HR',
}

/**
 * 16 Organizational Level Codes (L1-L10 Employee Track & H1-H6 HR Track)
 * seeded in PostgreSQL `organizational_levels`
 */
export enum OrganizationalLevelCode {
  // Employee Hierarchy (L1 - L10)
  L1_ExecutiveTechLeadership = 'L1',
  L2_DepartmentLeadership = 'L2',
  L3_EngineeringManagement = 'L3',
  L4_ProjectAndProductManagement = 'L4',
  L5_TechnicalAndArchitectureLeadership = 'L5',
  L6_TeamLeadership = 'L6',
  L7_SeniorIndividualContributor = 'L7',
  L8_MidLevelIndividualContributor = 'L8',
  L9_JuniorIndividualContributor = 'L9',
  L10_EntryTrainingLevel = 'L10',

  // HR Hierarchy (H1 - H6)
  H1_HrExecutiveLeadership = 'H1',
  H2_HrDepartmentManagement = 'H2',
  H3_HrPartnerAndOperationsManagement = 'H3',
  H4_SpecializedHrManagement = 'H4',
  H5_HrSpecialistExecutive = 'H5',
  H6_HrSupportAndCoordination = 'H6',
}

