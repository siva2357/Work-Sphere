import { Routes } from '@angular/router';

import { HrDashboard } from './hr-dashboard/hr-dashboard';
import { EmployeeDirectory } from './employee-directory/employee-directory';
import { PayrollManagement } from './payroll-management/payroll-management';
import { Announcements } from './announcements/announcements';
import { RecruitmentManagement } from './recruitment-management/recruitment-management';
import { RequestManagement } from '../shared/request-management/request-management';

export const HR_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: HrDashboard },
  { path: 'employee-directory', component: EmployeeDirectory },
  { path: 'requests-management', component: RequestManagement },
  { path: 'payroll-management', component: PayrollManagement },
  { path: 'announcements', component: Announcements },
  { path: 'recruitment-management', component: RecruitmentManagement }
];
