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

  private readonly defaultProposals: EmployeeLeaveProposal[] = [
    {
      id: 'LV-REQ-501',
      employeeId: 'EMP-0172',
      employeeName: 'Maya Lin',
      avatarColor: '#10b981',
      department: 'Core Web Platform',
      role: 'Senior Angular Engineer',
      email: 'maya.lin@worksphere.io',
      leaveType: 'Casual Leave',
      fromDate: '28 Oct 2026',
      toDate: '29 Oct 2026',
      days: 2,
      reason: 'Personal family event and travel to hometown for celebrations',
      appliedDate: '24 Oct 2026',
      status: 'Pending',
    },
    {
      id: 'LV-REQ-502',
      employeeId: 'EMP-0175',
      employeeName: 'Samuel Kim',
      avatarColor: '#f59e0b',
      department: 'Platform Services',
      role: 'Full Stack Java Engineer',
      email: 'samuel.kim@worksphere.io',
      leaveType: 'Sick Leave',
      fromDate: '27 Oct 2026',
      toDate: '27 Oct 2026',
      days: 1,
      reason: 'Acute fever, doctor consultation, and medical rest',
      appliedDate: '26 Oct 2026',
      status: 'Pending',
    },
    {
      id: 'LV-REQ-503',
      employeeId: 'EMP-0173',
      employeeName: 'Carlos Rivera',
      avatarColor: '#8b5cf6',
      department: 'Product Design',
      role: 'Senior Product Designer',
      email: 'carlos.rivera@worksphere.io',
      leaveType: 'Earned Leave',
      fromDate: '02 Nov 2026',
      toDate: '05 Nov 2026',
      days: 4,
      reason: 'Annual family road trip and personal rejuvenation vacation',
      appliedDate: '20 Oct 2026',
      status: 'Pending',
    },
    {
      id: 'LV-REQ-504',
      employeeId: 'EMP-0176',
      employeeName: 'Aisha Bello',
      avatarColor: '#ec4899',
      department: 'Quality Assurance',
      role: 'Lead Automation QA Engineer',
      email: 'aisha.bello@worksphere.io',
      leaveType: 'Comp-Off',
      fromDate: '15 Oct 2026',
      toDate: '15 Oct 2026',
      days: 1,
      reason: 'Compensatory off for weekend production deployment verification',
      appliedDate: '12 Oct 2026',
      status: 'Approved',
      approvedAt: '13 Oct 2026, 11:20 AM',
    },
    {
      id: 'LV-REQ-505',
      employeeId: 'EMP-0174',
      employeeName: 'Elena Rostova',
      avatarColor: '#0ea5e9',
      department: 'IT & Technology Platform',
      role: 'DevOps & SRE Specialist',
      email: 'elena.rostova@worksphere.io',
      leaveType: 'Casual Leave',
      fromDate: '08 Oct 2026',
      toDate: '09 Oct 2026',
      days: 2,
      reason: 'Government passport renewal appointment and document verification',
      appliedDate: '04 Oct 2026',
      status: 'Approved',
      approvedAt: '05 Oct 2026, 09:45 AM',
    },
    {
      id: 'LV-REQ-506',
      employeeId: 'EMP-0177',
      employeeName: 'Kevin Zhao',
      avatarColor: '#6366f1',
      department: 'Mobile Engineering',
      role: 'Cross-Platform Mobile Developer',
      email: 'kevin.zhao@worksphere.io',
      leaveType: 'Earned Leave',
      fromDate: '14 Oct 2026',
      toDate: '16 Oct 2026',
      days: 3,
      reason: 'Vacation request overlapping with quarterly mobile release milestone',
      appliedDate: '01 Oct 2026',
      status: 'Rejected',
      managerComments: 'Milestone sprint release requires mobile lead presence; please reschedule.',
      approvedAt: '02 Oct 2026, 04:15 PM',
    },
    {
      id: 'LV-REQ-507',
      employeeId: 'EMP-0178',
      employeeName: 'Arjun Mehta',
      avatarColor: '#14b8a6',
      department: 'IT & Technology Platform',
      role: 'AI & Machine Learning Engineer',
      email: 'arjun.mehta@worksphere.io',
      leaveType: 'Casual Leave',
      fromDate: '30 Oct 2026',
      toDate: '30 Oct 2026',
      days: 1,
      reason: 'Attending regional Python & AI Developer Conference in person',
      appliedDate: '25 Oct 2026',
      status: 'Pending',
    },
  ];

  constructor() {
    this.proposals = [...this.defaultProposals];
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
        if (res?.proposals && res.proposals.length > 0) {
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
        } else if (this.proposals.length === 0) {
        } else {
          this.proposals = [...this.defaultProposals];
        }
        this.proposalsSubject.next([...this.proposals]);
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
