import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AuthService } from './auth.service';
import {
  DailyAttendanceRecord,
  ManagedEmployeeAttendance,
} from '../models/attendance.interface';

export type { DailyAttendanceRecord, ManagedEmployeeAttendance };

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private selectedEmployeeId: string = 'EMP-005';
  private employees: ManagedEmployeeAttendance[] = [];
  private readonly employeesSubject = new BehaviorSubject<ManagedEmployeeAttendance[]>([]);
  readonly employees$ = this.employeesSubject.asObservable();
  private employeeLogsMap: Record<string, DailyAttendanceRecord[]> = {};

  constructor() {
    this.refreshTeamAttendanceFromBackend();
  }

  refreshManagedEmployees(): void {
    this.refreshTeamAttendanceFromBackend();
  }

  /**
   * Fetches Manager & Department Attendance records directly from PostgreSQL (GET /api/attendance/team).
   */
  refreshTeamAttendanceFromBackend(managerCode?: string, departmentCode?: string): void {
    const mgr = managerCode || this.authService.getCurrentManagerCode();
    const params: Record<string, string> = { managerCode: mgr };
    if (departmentCode && departmentCode !== 'All') {
      params['departmentCode'] = departmentCode;
    }

    const palette = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

    this.http
      .get<{ records?: any[] }>(API_ENDPOINTS.ATTENDANCE.TEAM, { params })
      .pipe(catchError(() => of({ records: [] })))
      .subscribe((res) => {
        if (res?.records) {
          this.employees = res.records.map((r, idx) => ({
            id: r.id || `EMP-00${idx + 1}`,
            name: r.name,
            email: r.email || `${r.name.toLowerCase().replace(/\s+/g, '.')}@worksphere.com`,
            phone: r.phone || '+91 98450 11223',
            role: r.role || 'Engineer',
            designation: `${r.role} (${r.level || 'L8'})`,
            department: r.department || 'Engineering',
            managerName: r.managerName || 'Department Manager',
            location: r.location || 'Bangalore, India',
            avatarColor: palette[idx % palette.length],
            todayStatus: r.todayStatus || 'Present',
            checkInTime: r.checkInTime || '09:05 AM',
            checkOutTime: r.checkOutTime || 'In-Office (Active)',
            workMode: r.workMode || 'On-site HQ',
            totalWorkingDays: r.totalWorkingDays || 22,
            presentDays: r.presentDays || 18,
            absentDays: r.absentDays || 0,
            onLeaveDays: r.onLeaveDays || 1,
            pendingDays: r.todayStatus === 'Pending' ? 1 : 0,
            overtimeHours: Number(r.overtimeHours || 0),
            attendanceRate: Number(r.attendanceRate || 95),
            reminderSent: !!r.reminderSent,
            lastReminderTime: r.lastReminderTime,
          }));
          this.employeesSubject.next([...this.employees]);
        }
      });
  }

  /**
   * Fetches individual employee attendance summary & logs from PostgreSQL (GET /api/attendance/my).
   */
  fetchMyAttendance$(employeeCode?: string): Observable<any> {
    const code = employeeCode || this.authService.getCurrentEmployeeCode();
    return this.http
      .get<any>(API_ENDPOINTS.ATTENDANCE.MY, {
        params: { employeeCode: code },
      })
      .pipe(
        tap((res) => {
          if (res?.logs && Array.isArray(res.logs)) {
            this.employeeLogsMap[code] = res.logs.map((l: any) => ({
              date: l.date || '',
              dayOfWeek: (l.dayName || 'Mon').substring(0, 3),
              status: l.status || 'Present',
              punchIn: l.loginTime || '--:--',
              punchOut: l.logoutTime || '--:--',
              workHours: l.hoursPresent || '--',
              overtime: l.overtime || '--',
              workMode: l.workMode || 'On-site HQ',
              approvalStatus: 'Auto-Approved',
              remarks: l.remarks || l.status,
            }));
          }
        })
      );
  }

  /**
   * Records Punch-In or Punch-Out in PostgreSQL (POST /api/attendance/mark).
   */
  markAttendance$(
    actionOrPayload:
      | 'PunchIn'
      | 'PunchOut'
      | 'PUNCH_IN'
      | 'PUNCH_OUT'
      | {
          employeeCode?: string;
          action: 'PUNCH_IN' | 'PUNCH_OUT' | 'PunchIn' | 'PunchOut';
          location?: string;
          workMode?: string;
          remarks?: string;
        },
    locationStr?: string
  ): Observable<any> {
    const payload =
      typeof actionOrPayload === 'string'
        ? {
            action: (actionOrPayload === 'PunchOut' || actionOrPayload === 'PUNCH_OUT'
              ? 'PUNCH_OUT'
              : 'PUNCH_IN') as 'PUNCH_IN' | 'PUNCH_OUT',
            location: locationStr,
          }
        : actionOrPayload;

    const code = payload.employeeCode || this.authService.getCurrentEmployeeCode();
    return this.http
      .post<any>(API_ENDPOINTS.ATTENDANCE.MARK, {
        employeeCode: code,
        action:
          payload.action === 'PunchOut' || payload.action === 'PUNCH_OUT'
            ? 'PUNCH_OUT'
            : 'PUNCH_IN',
        location: payload.location || locationStr || '17.4482, 78.3742',
        workMode: payload.workMode || 'On-site HQ',
        remarks: payload.remarks,
      })
      .pipe(tap(() => this.refreshTeamAttendanceFromBackend()));
  }

  getManagedEmployees(): ManagedEmployeeAttendance[] {
    return [...this.employees];
  }

  getEmployeeById(id: string): ManagedEmployeeAttendance | undefined {
    return this.employees.find((e) => e.id === id) || this.employees[0];
  }

  setSelectedEmployeeId(id: string): void {
    this.selectedEmployeeId = id;
    this.fetchMyAttendance$(id).subscribe();
  }

  getSelectedEmployeeId(): string {
    return this.selectedEmployeeId;
  }

  sendReminder(id: string): boolean {
    const emp = this.employees.find((e) => e.id === id);
    if (emp) {
      emp.reminderSent = true;
      emp.lastReminderTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.http
        .post(API_ENDPOINTS.ATTENDANCE.REMIND_EMPLOYEE(id), {})
        .pipe(catchError(() => of(null)))
        .subscribe();
      return true;
    }
    return false;
  }

  sendBatchReminders(): number {
    let count = 0;
    const pendingCodes: string[] = [];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.employees.forEach((emp) => {
      if (emp.todayStatus === 'Pending') {
        emp.reminderSent = true;
        emp.lastReminderTime = nowTime;
        pendingCodes.push(emp.id);
        count++;
      }
    });

    if (pendingCodes.length > 0) {
      this.http
        .post(API_ENDPOINTS.ATTENDANCE.REMIND_BATCH, {
          employeeCodes: pendingCodes,
          sentByManagerCode: this.authService.getCurrentManagerCode(),
        })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    return count;
  }

  generateMonthlyAttendanceLogs(empId: string, _month: string = 'October 2026'): DailyAttendanceRecord[] {
    if (this.employeeLogsMap[empId]) {
      return this.employeeLogsMap[empId];
    }
    this.fetchMyAttendance$(empId).subscribe();
    return this.employeeLogsMap[empId] || [];
  }
}
