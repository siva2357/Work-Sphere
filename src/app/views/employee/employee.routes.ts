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
import { CreateTask } from './task-management/create-task/create-task';
import { CreateProject } from './project-management/create-project/create-project';
import { TeamProfile } from './team-management/team-profile/team-profile';
import { AddNewEmployee } from './team-management/add-new-employee/add-new-employee';
import { AttendanceSheet } from './attendance-management/attendance-sheet/attendance-sheet';

export const EMPLOYEE_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: EmployeeDashboard },
  { path: 'task-management', component: TaskManagement },
  { path: 'create-task', component: CreateTask },
  { path: 'project-management', component: ProjectManagement },
  { path: 'create-project', component: CreateProject },
  { path: 'team-management', component: TeamManagement },
  { path: 'team-profile', component: TeamProfile },
  { path: 'add-new-employee', component: AddNewEmployee },
  { path: 'attendance-management', component: AttendanceManagement },
  { path: 'attendance-sheet', component: AttendanceSheet },
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
