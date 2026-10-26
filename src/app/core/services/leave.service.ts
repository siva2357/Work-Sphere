
import { Injectable } from '@angular/core';

export interface EmployeeLeaveProposal {
  id: string; // 'LV-REQ-501'
  employeeId: string; // 'EMP-0172'
  employeeName: string;
  avatarColor: string;
  department: string;
  role: string;
  email: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Comp-Off' | 'Annual Vacation';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  managerComments?: string;
  approvedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly STORAGE_KEY = 'worksphere_leave_proposals';

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

  private proposals: EmployeeLeaveProposal[] = [];

  constructor() {
    this.loadProposals();
  }

  private loadProposals(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          this.proposals = JSON.parse(stored);
          return;
        } catch { }
      }
    }
    this.proposals = [...this.defaultProposals];
    this.saveProposals();
  }

  private saveProposals(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.proposals));
      } catch (err) {
        console.error('Failed to save leave proposals', err);
      }
    }
  }

  getProposals(): EmployeeLeaveProposal[] {
    return [...this.proposals];
  }

  // Manager directly approves proposal
  approveProposal(id: string, comments?: string): boolean {
    const item = this.proposals.find((p) => p.id === id);
    if (item) {
      item.status = 'Approved';
      item.approvedAt = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      if (comments) item.managerComments = comments;
      this.saveProposals();
      return true;
    }
    return false;
  }

  // Manager directly rejects proposal
  rejectProposal(id: string, comments?: string): boolean {
    const item = this.proposals.find((p) => p.id === id);
    if (item) {
      item.status = 'Rejected';
      item.approvedAt = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      item.managerComments = comments || 'Request declined based on sprint delivery requirements.';
      this.saveProposals();
      return true;
    }
    return false;
  }

  // Batch approve all pending
  approveAllPending(): number {
    let count = 0;
    const nowTime = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    this.proposals.forEach((p) => {
      if (p.status === 'Pending') {
        p.status = 'Approved';
        p.approvedAt = nowTime;
        count++;
      }
    });
    this.saveProposals();
    return count;
  }
}
