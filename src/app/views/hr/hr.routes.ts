import { Routes } from '@angular/router';

import { HrDashboard } from './hr-dashboard/hr-dashboard';
import { EmployeeDirectory } from './employee-directory/employee-directory';
import { AttedanceManagement } from './attedance-management/attedance-management';
import { LeaveManagement } from './leave-management/leave-management';
import { PayrollManagement } from './payroll-management/payroll-management';
import { Announcements } from './announcements/announcements';
import { RecruitmentManagement } from './recruitment-management/recruitment-management';

export const HR_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: HrDashboard },
  { path: 'employee-directory', component: EmployeeDirectory },
  { path: 'attendance-management', component: AttedanceManagement },
  { path: 'leave-management', component: LeaveManagement },
  { path: 'payroll-management', component: PayrollManagement },
  { path: 'announcements', component: Announcements },
  { path: 'recruitment-management', component: RecruitmentManagement }
];
