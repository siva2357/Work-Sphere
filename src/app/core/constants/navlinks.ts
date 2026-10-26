import { NavLink } from "../models/sidebar.interface";

export const NAV_LINKS: NavLink[] = [
  // HR Navigation Links
  { label: 'Dashboard', path: '/hr/dashboard', icon: 'bi bi-grid-1x2', roles: ['hr'] },
  { label: 'Employee Directory', path: '/hr/employee-directory', icon: 'bi bi-people', roles: ['hr'] },
  { label: 'Payroll', path: '/hr/payroll-management', icon: 'bi bi-cash-stack', roles: ['hr'] },
  { label: 'Requests Management', path: '/hr/requests-management', icon: 'bi bi-inbox', roles: ['hr'] },
  { label: 'Announcements', path: '/hr/announcements', icon: 'bi bi-megaphone', roles: ['hr'] },
  { label: 'Recruitment', path: '/hr/recruitment-management', icon: 'bi bi-briefcase', roles: ['hr'] },

  // Employee Navigation Links
  { label: 'Dashboard', path: '/employee/dashboard', icon: 'bi bi-grid-1x2', roles: ['employee'] },
  { label: 'Team Management', path: '/employee/team-management', icon: 'bi bi-people', roles: ['employee'] },
  { label: 'Attendance Management', path: '/employee/attendance-management', icon: 'bi bi-clock-history', roles: ['employee'] },
  { label: 'Leave Management', path: '/employee/leave-management', icon: 'bi bi-calendar2-check', roles: ['employee'] },
  { label: 'Task Management', path: '/employee/task-management', icon: 'bi bi-check2-square', roles: ['employee'] },
  { label: 'Project Management', path: '/employee/project-management', icon: 'bi bi-kanban-fill', roles: ['employee'] },
  { label: 'Requests Management', path: '/employee/requests-management', icon: 'bi bi-inbox', roles: ['employee'] },


  { label: 'My Attendance', path: '/employee/my-attendance', icon: 'bi bi-clock-history', roles: ['employee'] },
  { label: 'My Tasks', path: '/employee/my-tasks', icon: 'bi bi-check2-square', roles: ['employee'] },
  { label: 'My Projects', path: '/employee/my-projects', icon: 'bi bi-kanban', roles: ['employee'] },

  { label: 'My Leaves', path: '/employee/my-leaves', icon: 'bi bi-calendar-event', roles: ['employee'] },
  { label: 'My Payroll', path: '/employee/my-payroll', icon: 'bi bi-cash-stack', roles: ['employee'] },
  { label: 'My Requests', path: '/employee/my-requests', icon: 'bi bi-inbox', roles: ['employee'] },
  { label: 'My Documents', path: '/employee/my-documents', icon: 'bi bi-folder2-open', roles: ['employee'] }
];
