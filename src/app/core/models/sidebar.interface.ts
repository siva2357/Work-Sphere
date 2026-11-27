export interface NavLink {
  label: string;
  path: string;
  icon: string;
  roles: string[]; // Portal types: ['hr'] or ['employee']
  /**
   * Optional Backend RBAC PermissionModule (e.g. 'Teams', 'Attendance', 'Leave', 'Tasks', 'Projects', 'Requests', 'Payroll', 'Employees')
   */
  module?: string;
  /**
   * Section grouping for sidebar layout: 'Overview', 'Management', 'HR Operations', 'Self-Service', 'Administration'
   */
  section?: string;
  /**
   * Specific System Role Codes allowed to access this link (e.g. 'EMP_ORG_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_PROJECT_MANAGER', 'EMP_TEAM_LEAD')
   */
  allowedRoleCodes?: string[];
  /**
   * Maximum numeric level permitted (where 1=L1 top leadership, 6=L6 Team Lead). E.g. maxLevel: 6 restricts to L1..L6.
   */
  maxLevel?: number;
  /**
   * Minimum numeric level permitted.
   */
  minLevel?: number;
  /**
   * If true, only shown to Leadership / Managers (L1-L6 or users with Team/Project/Department/Organization scope).
   */
  managementOnly?: boolean;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}
