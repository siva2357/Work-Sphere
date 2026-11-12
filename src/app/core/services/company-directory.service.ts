import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AuthService } from './auth.service';
import {
  CreateDirectoryEmployeePayload,
  DirectoryEmployeeRecord,
} from '../models/company-directory.interface';

export type { CreateDirectoryEmployeePayload, DirectoryEmployeeRecord };

@Injectable({
  providedIn: 'root',
})
export class CompanyDirectoryService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly employeesSubject = new BehaviorSubject<DirectoryEmployeeRecord[]>([]);
  readonly employees$ = this.employeesSubject.asObservable();

  refreshDirectory(companyCode?: string): void {
    this.getEmployeeDirectory$(companyCode).subscribe();
  }

  /**
   * Fetches all registered companies and their Main HR Administrator accounts from GET /api/companies.
   */
  getCompanies$(): Observable<any> {
    return this.http
      .get<any>(API_ENDPOINTS.COMPANIES.GET_ALL)
      .pipe(catchError(() => of({ totalCompanies: 0, companies: [] })));
  }

  /**
   * Lists all employees in the Company's Employee Directory (GET /api/companies/{companyCode}/directory).
   */
  getEmployeeDirectory$(
    companyCode?: string,
    departmentCode?: string,
    status?: string
  ): Observable<{
    company: any;
    totalEmployees: number;
    employees: DirectoryEmployeeRecord[];
  }> {
    const targetCompany = companyCode || this.authService.getCurrentCompanyCode();
    const params: Record<string, string> = {};
    if (departmentCode && departmentCode !== 'All') {
      params['departmentCode'] = departmentCode;
    }
    if (status && status !== 'All') {
      params['status'] = status;
    }

    return this.http
      .get<{
        company: any;
        totalEmployees: number;
        employees: DirectoryEmployeeRecord[];
      }>(API_ENDPOINTS.COMPANIES.COMPANY_DIRECTORY(targetCompany), { params })
      .pipe(
        tap((res) => {
          if (res?.employees) {
            this.employeesSubject.next(res.employees);
          }
        }),
        catchError(() =>
          of({ company: null, totalEmployees: 0, employees: [] })
        )
      );
  }

  /**
   * Main HR Only Action: Creates a new employee inside the Company's Employee Directory
   * (POST /api/companies/{companyCode}/directory/employees) and grants them login & RBAC role access.
   */
  createEmployeeByMainHr$(
    payload: CreateDirectoryEmployeePayload,
    companyCode?: string
  ): Observable<any> {
    const targetCompany = companyCode || this.authService.getCurrentCompanyCode();
    const currentUser = this.authService.currentUser;

    const defaultHr =
      targetCompany === 'CMP-002'
        ? 'hr.admin@nexacloud.io'
        : 'chro@worksphere.com';

    return this.http.post<any>(
      API_ENDPOINTS.COMPANIES.CREATE_EMPLOYEE_BY_MAIN_HR(targetCompany),
      {
        createdByHrEmailOrCode:
          payload.createdByHrEmailOrCode || currentUser?.email || defaultHr,
        fullName: payload.fullName,
        email: payload.email,
        initialPassword: payload.initialPassword || 'Welcome@12345',
        phone: payload.phone || '+91 98450 55667',
        departmentCode: payload.departmentCode || 'ENG',
        designationCode: payload.designationCode || 'DESIG_DEV',
        roleCode: payload.roleCode || 'EMP_DEVELOPER',
        employmentType: payload.employmentType || 'Full-time',
        workLocation: payload.workLocation || 'Bangalore, India',
        managerEmployeeCode: payload.managerEmployeeCode || 'EMP-004',
      }
    );
  }

  /**
   * Main HR Action: Bulk imports multiple employee records into the Company's Employee Directory
   * (POST /api/companies/{companyCode}/directory/bulk-import).
   */
  bulkImportEmployees$(
    employees: CreateDirectoryEmployeePayload[],
    companyCode?: string
  ): Observable<any> {
    const targetCompany = companyCode || this.authService.getCurrentCompanyCode();
    const currentUser = this.authService.currentUser;
    const defaultHr =
      targetCompany === 'CMP-002'
        ? 'hr.admin@nexacloud.io'
        : 'chro@worksphere.com';

    return this.http.post<any>(
      API_ENDPOINTS.COMPANIES.BULK_IMPORT(targetCompany),
      {
        createdByHrEmailOrCode: currentUser?.email || defaultHr,
        employees: employees.map((e) => ({
          ...e,
          createdByHrEmailOrCode: currentUser?.email || defaultHr,
          initialPassword: e.initialPassword || 'Welcome@12345',
          departmentCode: e.departmentCode || 'ENG',
          designationCode: e.designationCode || 'DESIG_DEV',
          employmentType: e.employmentType || 'Full-time',
          workLocation: e.workLocation || 'Bangalore, India',
        })),
      }
    );
  }

  /**
   * Main HR Action: Uploads and imports a CSV file directly via multipart/form-data
   * (POST /api/companies/{companyCode}/directory/import-csv).
   */
  importEmployeesCsv$(file: File, companyCode?: string): Observable<any> {
    const targetCompany = companyCode || this.authService.getCurrentCompanyCode();
    const currentUser = this.authService.currentUser;
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (currentUser?.email) {
      formData.append('createdByHrEmailOrCode', currentUser.email);
    }

    return this.http.post<any>(
      API_ENDPOINTS.COMPANIES.IMPORT_CSV(targetCompany),
      formData
    );
  }

  /**
   * Exports employee directory records to CSV and triggers a client-side download.
   */
  exportDirectoryCsv(employees: any[], filename?: string): void {
    if (!employees || employees.length === 0) return;

    const headers = [
      'EmployeeCode',
      'FullName',
      'Email',
      'Department',
      'Designation',
      'Status',
      'EmploymentType',
      'Location',
      'Phone',
      'ReportingManager',
      'JoiningDate',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = employees.map((e) => [
      escapeCsv(e.id || e.employeeCode),
      escapeCsv(e.name || e.fullName),
      escapeCsv(e.email),
      escapeCsv(e.department),
      escapeCsv(e.role || e.designationTitle),
      escapeCsv(e.status || 'Active'),
      escapeCsv(e.type || e.employmentType || 'Full-time'),
      escapeCsv(e.location || e.workLocation),
      escapeCsv(e.phone),
      escapeCsv(e.manager || e.managerEmployeeCode || 'Department Head'),
      escapeCsv(e.joiningDate || e.joinedAt || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      filename || `WorkSphere_Employee_Directory_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
