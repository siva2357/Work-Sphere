import { Routes } from '@angular/router';
import { PublicLayout } from './library/layouts/public-layout/public-layout';
import { AccountPages } from './views/account/account-pages';
import { Hr } from './views/hr/hr';
import { Employee } from './views/employee/employee';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    loadChildren: () => import('./library/layouts/public-layout/public.routes').then(m => m.PUBLIC_ROUTES)
  },
  {
    path: '',
    component: AccountPages,
    loadChildren: () => import('./views/account/account-pages.routes').then(m => m.ACCOUNT_ROUTES)
  },
  {
    path: 'hr',
    component: Hr,
    loadChildren: () => import('./views/hr/hr.routes').then(m => m.HR_ROUTES)
  },
  {
    path: 'employee',
    component: Employee,
    loadChildren: () => import('./views/employee/employee.routes').then(m => m.EMPLOYEE_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
