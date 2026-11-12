import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AuthService } from './auth.service';
import { ApprovalLevel, ManagedRequest } from '../models/request.interface';

export type { ApprovalLevel, ManagedRequest };

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private requests: ManagedRequest[] = [];
  private readonly requestsSubject = new BehaviorSubject<ManagedRequest[]>([]);
  readonly requests$ = this.requestsSubject.asObservable();

  constructor() {
    this.refreshRequestsFromBackend();
  }

  refreshRequests(): void {
    this.refreshRequestsFromBackend();
  }

  /**
   * Syncs Unified Employee Requests & Multi-Stage Approval Chains directly from PostgreSQL (GET /api/requests).
   */
  refreshRequestsFromBackend(): void {
    const palette = ['#10b981', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6'];

    this.http
      .get<any[]>(API_ENDPOINTS.REQUESTS.BASE)
      .pipe(catchError(() => of([])))
      .subscribe((backendRequests) => {
        if (Array.isArray(backendRequests)) {
          this.requests = backendRequests.map((r, idx) => ({
            id: r.id || `REQ-2026-${101 + idx}`,
            employeeId: r.employeeId || 'EMP-005',
            employeeName: r.employeeName || 'Employee',
            employeeEmail: r.employeeEmail || 'employee@worksphere.com',
            employeeRole: r.employeeRole || 'Software Developer',
            department: r.department || 'Engineering & Software Development',
            location: r.location || 'Bangalore, India (HQ)',
            avatarColor: palette[idx % palette.length],
            category: r.category || 'Promotion Request',
            subject: r.subject,
            description: r.description,
            submittedDate: r.submittedDate || '',
            priority: r.priority || 'High',
            overallStatus: r.overallStatus || 'Under Review',
            currentLevelNumber: Number(r.currentLevelNumber || 1),
            totalLevels: Number(r.totalLevels || 3),
            approvalChain: Array.isArray(r.approvalChain)
              ? r.approvalChain.map((step: any, sIdx: number) => ({
                levelNumber: Number(step.levelNumber || sIdx + 1),
                levelTitle: step.levelTitle || `Level ${sIdx + 1}`,
                role: step.role || 'Approver',
                approverName: step.approverName || step.role || 'Approver',
                approverId: step.approverId,
                avatarColor: palette[sIdx % palette.length],
                status: step.status || 'Pending',
                actionDate: step.actionDate,
                remarks: step.remarks,
                isCurrent: !!step.isCurrent,
                isFinalHR: !!step.isFinalHR,
              }))
              : [],
          }));
          this.requestsSubject.next([...this.requests]);
        }
      });
  }

  /**
   * Fetches all configured Multi-Stage Request Approval Workflows (Leave, Resignation, Hike, Promotion)
   * from GET /api/requests/workflows.
   */
  fetchRequestWorkflows$(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.REQUESTS.WORKFLOWS);
  }

  /**
   * Submits a new Employee Request (Leave, Resignation, Hike/Appraisal, Promotion) to PostgreSQL (POST /api/requests).
   */
  createRequest$(payload: {
    employeeId?: string;
    category: string;
    subject: string;
    description: string;
    priority?: string;
    leaveType?: string;
    leaveStartDate?: string;
    leaveEndDate?: string;
    leaveDays?: number;
    requestedDesignationCode?: string;
    currentCtc?: string;
    requestedCtc?: string;
    requestedHikePercentage?: number;
    proposedLastWorkingDay?: string;
    noticePeriodDays?: number;
  }): Observable<any> {
    return this.http
      .post<any>(API_ENDPOINTS.REQUESTS.BASE, {
        ...payload,
        employeeId: payload.employeeId || this.authService.getCurrentEmployeeCode(),
      })
      .pipe(tap(() => this.refreshRequestsFromBackend()));
  }

  getRequests(): ManagedRequest[] {
    return [...this.requests];
  }

  getRequestById(id: string): ManagedRequest | undefined {
    return this.requests.find((r) => r.id === id) || this.requests[0];
  }

  approveCurrentLevel(requestId: string, remarks?: string): { success: boolean; isFinal: boolean; message: string } {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return { success: false, isFinal: false, message: 'Request not found' };

    const currentLevel = req.approvalChain.find((l) => l.isCurrent);
    if (!currentLevel) {
      return { success: false, isFinal: false, message: 'No pending level to approve' };
    }

    const nowStr = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    currentLevel.status = 'Approved';
    currentLevel.actionDate = nowStr;
    if (remarks) currentLevel.remarks = remarks;
    currentLevel.isCurrent = false;

    this.http
      .post(API_ENDPOINTS.REQUESTS.APPROVE(requestId), {
        remarks: remarks || `Approved at ${currentLevel.levelTitle}`,
      })
      .pipe(catchError(() => of(null)))
      .subscribe();

    if (currentLevel.isFinalHR || req.currentLevelNumber >= req.totalLevels) {
      req.overallStatus = 'Approved';
      return {
        success: true,
        isFinal: true,
        message: `Final HR sign-off completed for ${req.id}! Request is now fully approved.`,
      };
    } else {
      req.currentLevelNumber++;
      const nextLevel = req.approvalChain.find((l) => l.levelNumber === req.currentLevelNumber);
      if (nextLevel) {
        nextLevel.isCurrent = true;
      }
      req.overallStatus = 'Under Review';
      return {
        success: true,
        isFinal: false,
        message: `Approved at ${currentLevel.levelTitle}. Forwarded to ${nextLevel?.levelTitle || 'next level'}.`,
      };
    }
  }

  rejectCurrentLevel(requestId: string, remarks?: string): boolean {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return false;

    const currentLevel = req.approvalChain.find((l) => l.isCurrent);
    if (currentLevel) {
      const nowStr = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      currentLevel.status = 'Rejected';
      currentLevel.actionDate = nowStr;
      currentLevel.remarks = remarks || 'Declined during review stage.';
      currentLevel.isCurrent = false;
    }

    req.overallStatus = 'Rejected';

    this.http
      .post(API_ENDPOINTS.REQUESTS.REJECT(requestId), {
        remarks: remarks || 'Declined during review stage.',
      })
      .pipe(catchError(() => of(null)))
      .subscribe();

    return true;
  }
}
