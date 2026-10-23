import { NavLink } from "../models/sidebar.interface";

export const NAV_LINKS: NavLink[] = [
  // HR Navigation Links
  { label: 'Dashboard', path: '/hr/dashboard', icon: 'bi bi-grid-1x2', roles: ['hr'] },
  { label: 'Employee Directory', path: '/hr/employee-directory', icon: 'bi bi-people', roles: ['hr'] },
  { label: 'Attendance Management', path: '/hr/attendance-management', icon: 'bi bi-clock-history', roles: ['hr'] },
  { label: 'Leave Management', path: '/hr/leave-management', icon: 'bi bi-calendar2-check', roles: ['hr'] },
  { label: 'Payroll', path: '/hr/payroll-management', icon: 'bi bi-cash-stack', roles: ['hr'] },
  { label: 'Requests Management', path: '/hr/requests-management', icon: 'bi bi-inbox', roles: ['hr'] },
  { label: 'Announcements', path: '/hr/announcements', icon: 'bi bi-megaphone', roles: ['hr'] },
  { label: 'Recruitment', path: '/hr/recruitment-management', icon: 'bi bi-briefcase', roles: ['hr'] },

  // Employee Navigation Links
  { label: 'Dashboard', path: '/employee/dashboard', icon: 'bi bi-grid-1x2', roles: ['employee'] },
  { label: 'My Profile', path: '/employee/my-profile', icon: 'bi bi-person', roles: ['employee'] },
  { label: 'My Attendance', path: '/employee/my-attendance', icon: 'bi bi-clock-history', roles: ['employee'] },
  { label: 'My Leaves', path: '/employee/my-leaves', icon: 'bi bi-calendar-event', roles: ['employee'] },
  { label: 'My Payroll', path: '/employee/my-payroll', icon: 'bi bi-cash-stack', roles: ['employee'] },
  { label: 'My Requests', path: '/employee/my-requests', icon: 'bi bi-inbox', roles: ['employee'] },
  { label: 'My Documents', path: '/employee/my-documents', icon: 'bi bi-folder2-open', roles: ['employee'] }
];
