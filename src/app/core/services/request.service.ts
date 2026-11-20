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

  private readonly defaultRequests: ManagedRequest[] = [
    {
      id: 'REQ-2026-101',
      employeeId: 'EMP-0142',
      employeeName: 'Rohan Sharma',
      employeeEmail: 'rohan.sharma@worksphere.io',
      employeeRole: 'Full Stack Java Engineer',
      department: 'Platform Services',
      location: 'Bangalore, India (HQ)',
      avatarColor: '#10b981',
      category: 'Promotion Request',
      subject: 'Nomination for Technical Lead (L5) - Platform Architecture',
      description: 'Formal application for promotion to Tech Lead L5 having led the microservices migration and mentoring 4 junior engineers for 18 months.',
      submittedDate: '2026-10-18',
      priority: 'High',
      overallStatus: 'Under Review',
      currentLevelNumber: 2,
      totalLevels: 3,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Direct Engineering Manager Sign-Off',
          role: 'Engineering Manager',
          approverName: 'Marcus Vance',
          avatarColor: '#0ea5e9',
          status: 'Approved',
          actionDate: '2026-10-19',
          remarks: 'Strong technical leadership, exceptional sprint velocity, and peer feedback.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Department Head / VP Engineering Review',
          role: 'VP of Engineering',
          approverName: 'Elena Rostova',
          avatarColor: '#8b5cf6',
          status: 'Pending',
          remarks: 'Pending executive quarterly band calibration meeting.',
          isCurrent: true,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'People Operations & Compensation Sign-Off',
          role: 'Head of People Operations',
          approverName: 'Sneha Chawla',
          avatarColor: '#ec4899',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
      attachments: [{ name: 'performance_review_h1_2026.pdf', size: '2.4 MB' }],
    },
    {
      id: 'REQ-2026-102',
      employeeId: 'EMP-0175',
      employeeName: 'Samuel Kim',
      employeeEmail: 'samuel.kim@worksphere.io',
      employeeRole: 'Platform Security Specialist',
      department: 'Cybersecurity & IAM',
      location: 'Singapore Hub',
      avatarColor: '#0ea5e9',
      category: 'Hardware / Asset',
      subject: 'High-Performance Security Audit Workstation & YubiKeys',
      description: 'Request for Apple M3 Max 64GB Unified Memory and FIPS 140-2 certified hardware security keys for zero-trust cryptographic testing.',
      submittedDate: '2026-10-21',
      priority: 'Urgent',
      overallStatus: 'Under Review',
      currentLevelNumber: 1,
      totalLevels: 2,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'IT Security & Infrastructure Lead',
          role: 'IT Security Lead',
          approverName: 'Sarah Jenkins',
          avatarColor: '#f59e0b',
          status: 'Pending',
          remarks: 'Verifying inventory allocation in APAC distribution center.',
          isCurrent: true,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Asset Management & IT Procurement',
          role: 'IT Procurement Manager',
          approverName: 'Sneha Chawla',
          avatarColor: '#ec4899',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
      attachments: [{ name: 'security_hardware_spec.pdf', size: '1.1 MB' }],
    },
    {
      id: 'REQ-2026-103',
      employeeId: 'EMP-0173',
      employeeName: 'Carlos Rivera',
      employeeEmail: 'carlos.rivera@worksphere.io',
      employeeRole: 'Senior Product Designer',
      department: 'Product Design',
      location: 'London, UK Branch',
      avatarColor: '#8b5cf6',
      category: 'Work From Home',
      subject: 'Temporary 4-Week Remote Work Arrangement (Overseas)',
      description: 'Requesting permission for remote work from Spain during November while maintaining GMT overlapping core hours and design sprints.',
      submittedDate: '2026-10-15',
      priority: 'Medium',
      overallStatus: 'Approved',
      currentLevelNumber: 2,
      totalLevels: 2,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Design Studio Lead Review',
          role: 'Design Director',
          approverName: 'Maya Lin',
          avatarColor: '#10b981',
          status: 'Approved',
          actionDate: '2026-10-16',
          remarks: 'Schedule and delivery milestones confirmed with Figma collaborative sessions.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'HR Cross-Border Compliance Check',
          role: 'People Operations Lead',
          approverName: 'Sneha Chawla',
          avatarColor: '#ec4899',
          status: 'Approved',
          actionDate: '2026-10-17',
          remarks: 'Tax and GDPR privacy compliance cleared for up to 30 continuous calendar days.',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
    },
    {
      id: 'REQ-2026-104',
      employeeId: 'EMP-0174',
      employeeName: 'Aisha Patel',
      employeeEmail: 'aisha.patel@worksphere.io',
      employeeRole: 'Staff Frontend Architect',
      department: 'Core Web Platform',
      location: 'Bangalore, India (HQ)',
      avatarColor: '#ec4899',
      category: 'Appraisal & Salary Review',
      subject: 'Annual Strategic Compensation & Equity Refresh Evaluation',
      description: 'Formal submission for annual market-rate compensation adjustment corresponding to exceptional ratings in FY26 H1 deliverable audits.',
      submittedDate: '2026-10-10',
      priority: 'High',
      overallStatus: 'Under Review',
      currentLevelNumber: 2,
      totalLevels: 3,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Engineering Director Sign-Off',
          role: 'Engineering Director',
          approverName: 'Marcus Vance',
          avatarColor: '#0ea5e9',
          status: 'Approved',
          actionDate: '2026-10-12',
          remarks: 'Exceeded all architectural KPIs and reduced frontend bundle size by 38%.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'VP People Operations & Finance Calibration',
          role: 'VP People Ops',
          approverName: 'Sneha Chawla',
          avatarColor: '#ec4899',
          status: 'Pending',
          remarks: 'Under final budget alignment with executive finance committee.',
          isCurrent: true,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'Chief People Officer & Executive Approval',
          role: 'Chief People Officer',
          approverName: 'David Sterling',
          avatarColor: '#f59e0b',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
      attachments: [{ name: 'strategic_impact_dossier.pdf', size: '3.8 MB' }],
    },
    {
      id: 'REQ-2026-105',
      employeeId: 'EMP-0176',
      employeeName: 'Zoe Zhang',
      employeeEmail: 'zoe.zhang@worksphere.io',
      employeeRole: 'Staff Cloud Infrastructure Engineer',
      department: 'Data & Cloud Infrastructure',
      location: 'San Francisco, USA',
      avatarColor: '#f59e0b',
      category: 'IT & System Access',
      subject: 'Production Kubernetes Cluster Elevated IAM Root Credentials',
      description: 'Break-glass temporary access request for multi-region EKS cluster maintenance and database failover drill scheduled for this weekend.',
      submittedDate: '2026-10-24',
      priority: 'Urgent',
      overallStatus: 'Pending',
      currentLevelNumber: 1,
      totalLevels: 2,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'SecOps & Compliance Gatekeeper',
          role: 'Principal Security Architect',
          approverName: 'Samuel Kim',
          avatarColor: '#0ea5e9',
          status: 'Pending',
          remarks: 'Audit logging and ephemeral session proxy configuration being verified.',
          isCurrent: true,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Cloud Operations Executive Approval',
          role: 'VP Infrastructure',
          approverName: 'Elena Rostova',
          avatarColor: '#8b5cf6',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
    },
    {
      id: 'REQ-2026-106',
      employeeId: 'EMP-0178',
      employeeName: 'Arjun Mehta',
      employeeEmail: 'arjun.mehta@worksphere.io',
      employeeRole: 'AI & Machine Learning Engineer',
      department: 'IT & Technology Platform',
      location: 'Bangalore, India (HQ)',
      avatarColor: '#14b8a6',
      category: 'Department Transfer',
      subject: 'Internal Lateral Transfer to AI Research & LLM Optimization Team',
      description: 'Formal request to transition from IT Platform services into Core AI Architecture to lead automated document intelligence initiatives.',
      submittedDate: '2026-10-08',
      priority: 'Medium',
      overallStatus: 'Approved',
      currentLevelNumber: 3,
      totalLevels: 3,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Releasing Manager Approval',
          role: 'IT Operations Lead',
          approverName: 'Vikram Malhotra',
          avatarColor: '#6366f1',
          status: 'Approved',
          actionDate: '2026-10-09',
          remarks: 'Handover plan documented and junior replacement designated.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Receiving Team Lead Sign-Off',
          role: 'Lead AI Scientist',
          approverName: 'Dr. Priya Nair',
          avatarColor: '#10b981',
          status: 'Approved',
          actionDate: '2026-10-11',
          remarks: 'Candidate passed internal technical screening with flying colors.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'HR Operations Transfer Notice',
          role: 'Head of People Operations',
          approverName: 'Sneha Chawla',
          avatarColor: '#ec4899',
          status: 'Approved',
          actionDate: '2026-10-14',
          remarks: 'Cost center change and new reporting lines scheduled for Nov 1st.',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
    },
    {
      id: 'REQ-2026-107',
      employeeId: 'EMP-0177',
      employeeName: 'Liam O’Connor',
      employeeEmail: 'liam.oconnor@worksphere.io',
      employeeRole: 'Lead SDET & Automation Engineer',
      department: 'Core Web Platform',
      location: 'Dublin, Ireland',
      avatarColor: '#6366f1',
      category: 'Expense Reimbursement',
      subject: 'Annual AWS Cloud Certification & Testing Tool Licensing',
      description: 'Reimbursement for AWS Certified Solutions Architect Professional exam voucher and Cypress Cloud team enterprise dashboard licence.',
      submittedDate: '2026-10-22',
      priority: 'Low',
      overallStatus: 'Approved',
      currentLevelNumber: 2,
      totalLevels: 2,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Department Head Approval',
          role: 'Engineering Manager',
          approverName: 'Marcus Vance',
          avatarColor: '#0ea5e9',
          status: 'Approved',
          actionDate: '2026-10-23',
          remarks: 'Within annual continuing education budget allocation.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Finance & Payroll Disbursement',
          role: 'Finance Officer',
          approverName: 'Sneha Chawla',
          avatarColor: '#ec4899',
          status: 'Approved',
          actionDate: '2026-10-25',
          remarks: 'Processed for payout in upcoming monthly payroll batch.',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
      attachments: [{ name: 'aws_exam_receipt_oct2026.pdf', size: '420 KB' }],
    },
  ];

  constructor() {
    this.requests = [...this.defaultRequests];
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
        if (Array.isArray(backendRequests) && backendRequests.length > 0) {
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
        } else {
          this.requests = [...this.defaultRequests];
        }
        this.requestsSubject.next([...this.requests]);
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
