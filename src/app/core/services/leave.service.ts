import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AuthService } from './auth.service';
import { EmployeeLeaveProposal } from '../models/leave.interface';

export type { EmployeeLeaveProposal };

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private proposals: EmployeeLeaveProposal[] = [];
  private readonly proposalsSubject = new BehaviorSubject<EmployeeLeaveProposal[]>([]);
  readonly proposals$ = this.proposalsSubject.asObservable();

  constructor() {
    this.refreshProposalsFromBackend();
  }

  refreshProposals(): void {
    this.refreshProposalsFromBackend();
  }

  /**
   * Syncs team leave proposals directly from PostgreSQL (GET /api/leaves/team).
   */
  refreshProposalsFromBackend(managerCode?: string): void {
    const mgr = managerCode || this.authService.getCurrentManagerCode();
    const palette = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9', '#6366f1', '#14b8a6'];

    this.http
      .get<{ proposals?: any[] }>(API_ENDPOINTS.LEAVES.TEAM, {
        params: { managerCode: mgr },
      })
      .pipe(catchError(() => of({ proposals: [] })))
      .subscribe((res) => {
        if (res?.proposals) {
          this.proposals = res.proposals.map((p, idx) => ({
            id: p.leaveCode || p.id || `LV-REQ-${501 + idx}`,
            employeeId: p.employeeCode || 'EMP-005',
            employeeName: p.employeeName || 'Employee',
            avatarColor: palette[idx % palette.length],
            department: p.department || 'Engineering',
            role: p.role || 'Developer',
            email: `${(p.employeeName || 'employee').toLowerCase().replace(/\s+/g, '.')}@worksphere.com`,
            leaveType: p.leaveType || 'Casual Leave',
            fromDate: p.startDate || '',
            toDate: p.endDate || '',
            days: Number(p.days || 1),
            reason: p.reason || '',
            appliedDate: p.appliedOn || '',
            status: p.status || 'Pending',
            managerComments: p.managerComments,
          }));
          this.proposalsSubject.next([...this.proposals]);
        }
      });
  }

  /**
   * Fetches personal leave balances (CL, SL, EL, CO) & leave history from PostgreSQL (GET /api/leaves/my/{employeeCode}).
   */
  fetchMyLeaves$(employeeCode?: string): Observable<any> {
    const code = employeeCode || this.authService.getCurrentEmployeeCode();
    return this.http.get<any>(API_ENDPOINTS.LEAVES.MY(code));
  }

  /**
   * Submits a new leave application to PostgreSQL (POST /api/leaves).
   */
  applyLeave$(payload: {
    employeeCode?: string;
    leaveType: string;
    fromDate?: string;
    toDate?: string;
    startDate?: string;
    endDate?: string;
    days?: number;
    reason: string;
  }): Observable<any> {
    const code = payload.employeeCode || this.authService.getCurrentEmployeeCode();
    return this.http
      .post<any>(API_ENDPOINTS.LEAVES.BASE, {
        employeeCode: code,
        leaveType: payload.leaveType,
        fromDate: payload.fromDate || payload.startDate,
        toDate: payload.toDate || payload.endDate,
        days: payload.days,
        reason: payload.reason,
      })
      .pipe(tap(() => this.refreshProposalsFromBackend()));
  }

  getProposals(): EmployeeLeaveProposal[] {
    return [...this.proposals];
  }

  approveProposal(id: string, comments?: string): boolean {
    const item = this.proposals.find((p) => p.id === id);
    if (item) {
      item.status = 'Approved';
      item.approvedAt = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      if (comments) item.managerComments = comments;

      this.http
        .post(API_ENDPOINTS.LEAVES.APPROVE(id), {
          managerEmployeeCode: this.authService.getCurrentManagerCode(),
          comments: comments || 'Approved by Manager.',
        })
        .pipe(catchError(() => of(null)))
        .subscribe();

      return true;
    }
    return false;
  }

  rejectProposal(id: string, comments?: string): boolean {
    const item = this.proposals.find((p) => p.id === id);
    if (item) {
      item.status = 'Rejected';
      item.approvedAt = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      item.managerComments = comments || 'Request declined based on sprint delivery requirements.';

      this.http
        .post(API_ENDPOINTS.LEAVES.REJECT(id), {
          managerEmployeeCode: this.authService.getCurrentManagerCode(),
          comments: item.managerComments,
        })
        .pipe(catchError(() => of(null)))
        .subscribe();

      return true;
    }
    return false;
  }

  approveAllPending(): number {
    let count = 0;
    const nowTime = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    this.proposals.forEach((p) => {
      if (p.status === 'Pending') {
        p.status = 'Approved';
        p.approvedAt = nowTime;
        count++;

        this.http
          .post(API_ENDPOINTS.LEAVES.APPROVE(p.id), {
            managerEmployeeCode: this.authService.getCurrentManagerCode(),
            comments: 'Batch approved by Manager.',
          })
          .pipe(catchError(() => of(null)))
          .subscribe();
      }
    });
    return count;
  }
}
