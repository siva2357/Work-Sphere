export interface NavLink {
  label: string;
  path: string;
  icon: string;
  roles: string[];
  /**
   * Optional Backend RBAC PermissionModule (e.g. 'Teams', 'Attendance', 'Leave', 'Tasks', 'Projects', 'Requests', 'Recruitment', 'Payroll', 'Employees')
   */
  module?: string;
  /**
   * If true, only shown to Leadership / Managers (L1-L6 or users with Team/Project/Department/Organization scope) when logged in.
   */
  managementOnly?: boolean;
}
