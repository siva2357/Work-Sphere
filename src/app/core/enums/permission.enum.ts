/**
 * Atomic Permission Actions seeded in PostgreSQL `permissions`
 */
export enum PermissionAction {
  View = 'View',
  Create = 'Create',
  Edit = 'Edit',
  Delete = 'Delete',
  Assign = 'Assign',
  Approve = 'Approve',
  Reject = 'Reject',
  Review = 'Review',
  Export = 'Export',
  Manage = 'Manage',
}

/**
 * System Permission Modules seeded in PostgreSQL `permissions`
 */
export enum PermissionModule {
  Dashboard = 'Dashboard',
  Employees = 'Employees',
  Departments = 'Departments',
  Teams = 'Teams',
  Projects = 'Projects',
  Tasks = 'Tasks',
  Attendance = 'Attendance',
  Leave = 'Leave',
  WorkLogs = 'WorkLogs',
  Performance = 'Performance',
  Payroll = 'Payroll',
  SalaryStructure = 'SalaryStructure',
  Payslips = 'Payslips',
  Documents = 'Documents',
  Recruitment = 'Recruitment',
  JobOpenings = 'JobOpenings',
  Candidates = 'Candidates',
  Interviews = 'Interviews',
  Offers = 'Offers',
  Onboarding = 'Onboarding',
  Requests = 'Requests',
  Reports = 'Reports',
  Settings = 'Settings',
  HrSettings = 'HrSettings',
}

/**
 * Data Visibility Scopes seeded in PostgreSQL `role_permissions`
 */
export enum DataScope {
  Own = 'Own',
  Delegated = 'Delegated',
  Team = 'Team',
  Project = 'Project',
  Department = 'Department',
  Organization = 'Organization',
}

