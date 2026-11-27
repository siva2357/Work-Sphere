import { NavLink } from '../models/sidebar.interface';

export const NAV_LINKS: NavLink[] = [
  // ==================== HR PORTAL NAVIGATION ====================
  // 1. Overview
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'bi bi-grid-1x2',
    roles: ['hr'],
    module: 'Dashboard',
    section: 'Overview'
  },

  // 2. HR Management Operations
  {
    label: 'Employee Directory',
    path: '/employee-directory',
    icon: 'bi bi-people',
    roles: ['hr'],
    module: 'Employees',
    section: 'HR Operations',
    allowedRoleCodes: ['EMP_HR_ADMIN', 'EMP_HR_EXECUTIVE', 'EMP_DEPT_MANAGER', 'EMP_ORG_ADMIN', 'EMP_SUPER_ADMIN']
  },
  {
    label: 'Payroll',
    path: '/payroll-management',
    icon: 'bi bi-cash-stack',
    roles: ['hr'],
    module: 'Payroll',
    section: 'HR Operations',
    allowedRoleCodes: ['EMP_HR_ADMIN', 'EMP_PAYROLL_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_ORG_ADMIN', 'EMP_SUPER_ADMIN']
  },
  {
    label: 'Requests Management',
    path: '/requests-management',
    icon: 'bi bi-inbox',
    roles: ['hr'],
    module: 'Requests',
    section: 'HR Operations',
    allowedRoleCodes: ['EMP_HR_ADMIN', 'EMP_HR_EXECUTIVE', 'EMP_PAYROLL_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_ORG_ADMIN', 'EMP_SUPER_ADMIN']
  },
  {
    label: 'Announcements',
    path: '/announcements',
    icon: 'bi bi-megaphone',
    roles: ['hr'],
    module: 'Announcements',
    section: 'HR Operations'
  },

  // 3. Organization Administration
  {
    label: 'Organization & Roles',
    path: '/organizations&departments',
    icon: 'bi bi-diagram-3',
    roles: ['hr'],
    module: 'Organizations',
    section: 'Administration',
    allowedRoleCodes: ['EMP_HR_ADMIN', 'EMP_ORG_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_SUPER_ADMIN']
  },

  // ==================== EMPLOYEE & LEADERSHIP PORTAL ====================
  // 1. Overview
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'bi bi-grid-1x2',
    roles: ['employee'],
    module: 'Dashboard',
    section: 'Overview'
  },

  // 2. Leadership & Management Workspace (L1 - L6 Leadership or Manager Role Codes)
  {
    label: 'Team Management',
    path: '/team-management',
    icon: 'bi bi-people',
    roles: ['employee'],
    module: 'Teams',
    section: 'Management',
    managementOnly: true,
    maxLevel: 6,
    allowedRoleCodes: ['EMP_ORG_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_PROJECT_MANAGER', 'EMP_TEAM_LEAD', 'EMP_SUPER_ADMIN']
  },
  {
    label: 'Attendance Management',
    path: '/attendance-management',
    icon: 'bi bi-clock-history',
    roles: ['employee'],
    module: 'Attendance',
    section: 'Management',
    managementOnly: true,
    maxLevel: 6,
    allowedRoleCodes: ['EMP_ORG_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_PROJECT_MANAGER', 'EMP_TEAM_LEAD', 'EMP_SUPER_ADMIN']
  },
  {
    label: 'Leave Management',
    path: '/leave-management',
    icon: 'bi bi-calendar2-check',
    roles: ['employee'],
    module: 'Leave',
    section: 'Management',
    managementOnly: true,
    maxLevel: 6,
    allowedRoleCodes: ['EMP_ORG_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_PROJECT_MANAGER', 'EMP_TEAM_LEAD', 'EMP_SUPER_ADMIN']
  },
  {
    label: 'Task Management',
    path: '/task-management',
    icon: 'bi bi-check2-square',
    roles: ['employee'],
    module: 'Tasks',
    section: 'Management',
    managementOnly: true,
    maxLevel: 6,
    allowedRoleCodes: ['EMP_ORG_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_PROJECT_MANAGER', 'EMP_TEAM_LEAD', 'EMP_SUPER_ADMIN']
  },
  {
    label: 'Project Management',
    path: '/project-management',
    icon: 'bi bi-kanban-fill',
    roles: ['employee'],
    module: 'Projects',
    section: 'Management',
    managementOnly: true,
    maxLevel: 5,
    allowedRoleCodes: ['EMP_ORG_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_PROJECT_MANAGER', 'EMP_SUPER_ADMIN']
  },
  {
    label: 'Requests Management',
    path: '/requests-management',
    icon: 'bi bi-inbox',
    roles: ['employee'],
    module: 'Requests',
    section: 'Management',
    managementOnly: true,
    maxLevel: 6,
    allowedRoleCodes: ['EMP_ORG_ADMIN', 'EMP_DEPT_MANAGER', 'EMP_PROJECT_MANAGER', 'EMP_TEAM_LEAD', 'EMP_SUPER_ADMIN']
  },

  // 3. Employee Self-Service Workspace (Available to all L1 - L10 levels)
  {
    label: 'My Attendance',
    path: '/my-attendance',
    icon: 'bi bi-clock-history',
    roles: ['employee'],
    module: 'Attendance',
    section: 'Self-Service'
  },
  {
    label: 'My Tasks',
    path: '/my-tasks',
    icon: 'bi bi-check2-square',
    roles: ['employee'],
    module: 'Tasks',
    section: 'Self-Service'
  },
  {
    label: 'My Projects',
    path: '/my-projects',
    icon: 'bi bi-kanban',
    roles: ['employee'],
    module: 'Projects',
    section: 'Self-Service'
  },
  {
    label: 'My Leaves',
    path: '/my-leaves',
    icon: 'bi bi-calendar-event',
    roles: ['employee'],
    module: 'Leave',
    section: 'Self-Service'
  },
  {
    label: 'My Payroll',
    path: '/my-payroll',
    icon: 'bi bi-cash-stack',
    roles: ['employee'],
    module: 'Payroll',
    section: 'Self-Service'
  },
  {
    label: 'My Requests',
    path: '/my-requests',
    icon: 'bi bi-inbox',
    roles: ['employee'],
    module: 'Requests',
    section: 'Self-Service'
  },
  {
    label: 'My Documents',
    path: '/my-documents',
    icon: 'bi bi-folder2-open',
    roles: ['employee'],
    section: 'Self-Service'
  }
];
