import { Routes } from '@angular/router';

import { EmployeeDashboard } from './employee-dashboard/employee-dashboard';
import { MyProfile } from './my-profile/my-profile';
import { MyAttendance } from './my-attendance/my-attendance';
import { MyLeaves } from './my-leaves/my-leaves';
import { MyDocuments } from './my-documents/my-documents';
import { MyPayroll } from './my-payroll/my-payroll';
import { MyRequests } from './my-requests/my-requests';
import { TaskManagement } from './task-management/task-management';
import { ProjectManagement } from './project-management/project-management';
import { TeamManagement } from './team-management/team-management';
import { LeaveManagement } from './leave-management/leave-management';
import { AttendanceManagement } from './attendance-management/attendance-management';
import { RequestManagement } from '../shared/request-management/request-management';
import { MarkAttendance } from './my-attendance/mark-attendance/mark-attendance';
import { ApplyLeave } from './my-leaves/apply-leave/apply-leave';
import { ApplyRequest } from './my-requests/apply-request/apply-request';
import { MyTasks } from './my-tasks/my-tasks';
import { TaskDetails } from './my-tasks/task-details/task-details';
import { MyProjects } from './my-projects/my-projects';

export const EMPLOYEE_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: EmployeeDashboard },
  { path: 'task-management', component: TaskManagement },
  { path: 'project-management', component: ProjectManagement },
  { path: 'team-management', component: TeamManagement },
  { path: 'attendance-management', component: AttendanceManagement },
  { path: 'leave-management', component: LeaveManagement },
  { path: 'requests-management', component: RequestManagement },
  { path: 'my-profile', component: MyProfile },
  { path: 'my-tasks', component: MyTasks },

  { path: 'task-details', component: TaskDetails },
  { path: 'my-attendance', component: MyAttendance },
  { path: 'mark-attendance', component: MarkAttendance },
  { path: 'my-leaves', component: MyLeaves },
  { path: 'my-projects', component: MyProjects },
  { path: 'apply-leave', component: ApplyLeave },
  { path: 'my-documents', component: MyDocuments },
  { path: 'my-payroll', component: MyPayroll },
  { path: 'my-requests', component: MyRequests },
  { path: 'apply-request', component: ApplyRequest }
];
