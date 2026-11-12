import { NavLink } from '../models/sidebar.interface';

export const NAV_LINKS: NavLink[] = [
  // HR Portal Navigation Links - H1 to H6 Hierarchy
  { label: 'Dashboard', path: '/dashboard', icon: 'bi bi-grid-1x2', roles: ['hr'], module: 'Dashboard' },
  { label: 'Employee Directory', path: '/employee-directory', icon: 'bi bi-people', roles: ['hr'], module: 'Employees' },
  { label: 'Payroll', path: '/payroll-management', icon: 'bi bi-cash-stack', roles: ['hr'], module: 'Payroll' },
  { label: 'Requests Management', path: '/requests-management', icon: 'bi bi-inbox', roles: ['hr'], module: 'Requests' },
  { label: 'Announcements', path: '/announcements', icon: 'bi bi-megaphone', roles: ['hr'], module: 'Announcements' },
  { label: 'Recruitment', path: '/recruitment-management', icon: 'bi bi-briefcase', roles: ['hr'], module: 'Recruitment' },
  { label: 'Organization & Roles', path: '/organizations&departments', icon: 'bi bi-people', roles: ['hr'], module: 'Organizations' },

  // Employee & Manager Portal Navigation Links - L1 to L10 Hierarchy
  { label: 'Dashboard', path: '/dashboard', icon: 'bi bi-grid-1x2', roles: ['employee'], module: 'Dashboard' },

  // Manager / Leadership Workspace Modules (L1-L6 or Team/Project/Department Scope)
  { label: 'Team Management', path: '/team-management', icon: 'bi bi-people', roles: ['employee'], module: 'Teams', managementOnly: true },
  { label: 'Attendance Management', path: '/attendance-management', icon: 'bi bi-clock-history', roles: ['employee'], module: 'Attendance', managementOnly: true },
  { label: 'Leave Management', path: '/leave-management', icon: 'bi bi-calendar2-check', roles: ['employee'], module: 'Leave', managementOnly: true },
  { label: 'Task Management', path: '/task-management', icon: 'bi bi-check2-square', roles: ['employee'], module: 'Tasks', managementOnly: true },
  { label: 'Project Management', path: '/project-management', icon: 'bi bi-kanban-fill', roles: ['employee'], module: 'Projects', managementOnly: true },
  { label: 'Requests Management', path: '/requests-management', icon: 'bi bi-inbox', roles: ['employee'], module: 'Requests', managementOnly: true },

  // Individual Employee Self-Service Modules (All L1-L10 Levels)
  { label: 'My Attendance', path: '/my-attendance', icon: 'bi bi-clock-history', roles: ['employee'], module: 'Attendance' },
  { label: 'My Tasks', path: '/my-tasks', icon: 'bi bi-check2-square', roles: ['employee'], module: 'Tasks' },
  { label: 'My Projects', path: '/my-projects', icon: 'bi bi-kanban', roles: ['employee'], module: 'Projects' },
  { label: 'My Leaves', path: '/my-leaves', icon: 'bi bi-calendar-event', roles: ['employee'], module: 'Leave' },
  { label: 'My Payroll', path: '/my-payroll', icon: 'bi bi-cash-stack', roles: ['employee'], module: 'Payroll' },
  { label: 'My Requests', path: '/my-requests', icon: 'bi bi-inbox', roles: ['employee'], module: 'Requests' },
  { label: 'My Documents', path: '/my-documents', icon: 'bi bi-folder2-open', roles: ['employee'] },
];
