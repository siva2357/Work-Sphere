/**
 * Centralized Frontend API Constants mirroring Backend/Constants/ApiConstants.cs
 * Base Backend URL: http://localhost:5000
 */
export const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,

  // 1. Authentication & Current Session (/api/auth)
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    ME: `${API_BASE_URL}/api/auth/me`,
  },

  // 2. Companies (External Main Website Sync) & Main HR Employee Directory
  COMPANIES: {
    GET_ALL: `${API_BASE_URL}/api/companies`,
    GET_BY_CODE: (companyCode: string) => `${API_BASE_URL}/api/companies/${companyCode}`,
    EXTERNAL_REGISTER: `${API_BASE_URL}/api/companies/external-register`,
    COMPANY_DIRECTORY: (companyCode: string = 'CMP-001') =>
      `${API_BASE_URL}/api/companies/${companyCode}/directory`,
    EMPLOYEE_DIRECTORY: `${API_BASE_URL}/api/employee-directory`,
    CREATE_EMPLOYEE_BY_MAIN_HR: (companyCode: string = 'CMP-001') =>
      `${API_BASE_URL}/api/companies/${companyCode}/directory/employees`,
    BULK_IMPORT: (companyCode: string = 'CMP-001') =>
      `${API_BASE_URL}/api/companies/${companyCode}/directory/bulk-import`,
    IMPORT_CSV: (companyCode: string = 'CMP-001') =>
      `${API_BASE_URL}/api/companies/${companyCode}/directory/import-csv`,
  },

  // 3. RBAC, Organizational Hierarchy (L1-L10 & H1-H6) & 22 Departments (/api/rbac)
  RBAC: {
    DEPARTMENTS: `${API_BASE_URL}/api/rbac/departments`,
    DEPARTMENT_BY_ID: (id: string) => `${API_BASE_URL}/api/rbac/departments/${id}`,
    LEVELS: `${API_BASE_URL}/api/rbac/levels`,
    DESIGNATIONS: `${API_BASE_URL}/api/rbac/designations`,
    DESIGNATION_BY_ID: (id: string) => `${API_BASE_URL}/api/rbac/designations/${id}`,
    ROLES: `${API_BASE_URL}/api/rbac/roles`,
    PERMISSIONS: `${API_BASE_URL}/api/rbac/permissions`,
    ROLE_PERMISSIONS: (roleCode: string) =>
      `${API_BASE_URL}/api/rbac/roles/${roleCode}/permissions`,
    EMPLOYEES: `${API_BASE_URL}/api/rbac/employees`,
    EMPLOYEE_OVERRIDES: (employeeId: string) =>
      `${API_BASE_URL}/api/rbac/employees/${employeeId}/overrides`,
    APPROVAL_WORKFLOWS: `${API_BASE_URL}/api/rbac/approval-workflows`,
  },

  // 4. 4-Phase Recruitment & Onboarding Funnel (/api/recruitment)
  RECRUITMENT: {
    WORKFLOW_OVERVIEW: `${API_BASE_URL}/api/recruitment/workflow-overview`,
    JOBS: `${API_BASE_URL}/api/recruitment/jobs`,
    EXTERNAL_APPLY: `${API_BASE_URL}/api/recruitment/external/apply`,
    CANDIDATES: `${API_BASE_URL}/api/recruitment/candidates`,
    EVALUATE_PHASE: (candidateId: string) =>
      `${API_BASE_URL}/api/recruitment/candidates/${candidateId}/evaluate-phase`,
    ONBOARD_CANDIDATE: (candidateId: string) =>
      `${API_BASE_URL}/api/recruitment/candidates/${candidateId}/onboard`,
  },

  // 5. Unified Request Management Linked to Multi-Stage Approval Chains (/api/requests)
  REQUESTS: {
    BASE: `${API_BASE_URL}/api/requests`,
    WORKFLOWS: `${API_BASE_URL}/api/requests/workflows`,
    APPROVE: (requestCode: string) => `${API_BASE_URL}/api/requests/${requestCode}/approve`,
    REJECT: (requestCode: string) => `${API_BASE_URL}/api/requests/${requestCode}/reject`,
  },

  // 6. Attendance Management (Manager/Department Sheet) & My Attendance (/api/attendance)
  ATTENDANCE: {
    MY: `${API_BASE_URL}/api/attendance/my`,
    MARK: `${API_BASE_URL}/api/attendance/mark`,
    TEAM: `${API_BASE_URL}/api/attendance/team`,
    REMIND_EMPLOYEE: (employeeCode: string) =>
      `${API_BASE_URL}/api/attendance/remind/${employeeCode}`,
    REMIND_BATCH: `${API_BASE_URL}/api/attendance/remind-batch`,
  },

  // 7. Task Management (Assign Tasks to Team Members) & My Tasks (/api/tasks)
  TASKS: {
    BASE: `${API_BASE_URL}/api/tasks`,
    UPDATE_STATUS: (taskCode: string) => `${API_BASE_URL}/api/tasks/${taskCode}/status`,
    DELETE: (taskCode: string) => `${API_BASE_URL}/api/tasks/${taskCode}`,
  },

  // 8. Leave Management (Manager Approval) & My Leaves (/api/leaves)
  LEAVES: {
    BASE: `${API_BASE_URL}/api/leaves`,
    MY: (employeeCode: string) => `${API_BASE_URL}/api/leaves/my/${employeeCode}`,
    TEAM: `${API_BASE_URL}/api/leaves/team`,
    APPROVE: (leaveCode: string) => `${API_BASE_URL}/api/leaves/${leaveCode}/approve`,
    REJECT: (leaveCode: string) => `${API_BASE_URL}/api/leaves/${leaveCode}/reject`,
  },

  // 9. Employee & Manager Workspace: Documents, Projects, Teams & My Payroll (/api)
  WORKSPACE: {
    MY_DOCUMENTS: (employeeCode: string) =>
      `${API_BASE_URL}/api/documents/my/${employeeCode}`,
    DOCUMENTS: `${API_BASE_URL}/api/documents`,
    PROJECTS: `${API_BASE_URL}/api/projects`,
    TEAM_MEMBERS: `${API_BASE_URL}/api/teams/members`,
    MY_PAYROLL: (employeeCode: string) =>
      `${API_BASE_URL}/api/payroll/my/${employeeCode}`,
  },

  // 10. Helpers & Dropdown Lookups (/api/helpers)
  HELPERS: {
    BASE: `${API_BASE_URL}/api/helpers`,
    DROPDOWNS: `${API_BASE_URL}/api/helpers/dropdowns`,
    COMPANIES: `${API_BASE_URL}/api/helpers/companies`,
    ORGANIZATIONAL_LEVELS: `${API_BASE_URL}/api/helpers/organizational-levels`,
    DEPARTMENTS: `${API_BASE_URL}/api/helpers/departments`,
    DESIGNATIONS: `${API_BASE_URL}/api/helpers/designations`,
    ROLES: `${API_BASE_URL}/api/helpers/roles`,
    PERMISSIONS: `${API_BASE_URL}/api/helpers/permissions`,
    ROLE_PERMISSIONS: `${API_BASE_URL}/api/helpers/role-permissions`,
  },
} as const;

