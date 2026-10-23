import { Routes } from '@angular/router';

import { EmployeeDashboard } from './employee-dashboard/employee-dashboard';
import { MyProfile } from './my-profile/my-profile';
import { MyAttendance } from './my-attendance/my-attendance';
import { MyLeaves } from './my-leaves/my-leaves';
import { MyDocuments } from './my-documents/my-documents';
import { MyPayroll } from './my-payroll/my-payroll';
import { MyRequests } from './my-requests/my-requests';

export const EMPLOYEE_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: EmployeeDashboard },
  { path: 'my-profile', component: MyProfile },
  { path: 'my-attendance', component: MyAttendance },
  { path: 'my-leaves', component: MyLeaves },
  { path: 'my-documents', component: MyDocuments },
  { path: 'my-payroll', component: MyPayroll },
  { path: 'my-requests', component: MyRequests }
];
