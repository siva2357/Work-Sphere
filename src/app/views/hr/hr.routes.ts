import { Routes } from '@angular/router';

import { HrDashboard } from './hr-dashboard/hr-dashboard';
import { EmployeeDirectory } from './employee-directory/employee-directory';
import { PayrollManagement } from './payroll-management/payroll-management';
import { Announcements } from './announcements/announcements';
import { RecruitmentManagement } from './recruitment-management/recruitment-management';
import { RequestManagement } from '../shared/request-management/request-management';
import { MyProfile } from '../shared/my-profile/my-profile';

export const HR_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: HrDashboard },
  { path: 'recruitment-management', component: RecruitmentManagement },
  { path: 'employee-directory', component: EmployeeDirectory },
  { path: 'payroll-management', component: PayrollManagement },
  { path: 'announcements', component: Announcements },
  { path: 'requests-management', component: RequestManagement },
  { path: 'my-profile', component: MyProfile },

];
