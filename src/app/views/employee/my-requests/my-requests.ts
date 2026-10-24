import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface EmployeeRequest {
  sNo: number;
  requestId: string;
  category:
    | 'Hardware / Asset'
    | 'IT & System Access'
    | 'Promotion Request'
    | 'Appraisal & Salary Review'
    | 'Department Transfer'
    | 'Resignation Request'
    | 'Work From Home'
    | 'Expense Reimbursement';
  subject: string;
  description: string;
  submittedDate: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  assignedTo: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'In Progress';
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css',
})
export class MyRequests {
  // Filters
  statusFilter: string = 'ALL';
  categoryFilter: string = 'ALL';

  // Available Categories for Dropdown Filter
  availableCategories: string[] = [
    'Hardware / Asset',
    'IT & System Access',
    'Promotion Request',
    'Appraisal & Salary Review',
    'Department Transfer',
    'Resignation Request',
    'Work From Home',
    'Expense Reimbursement',
  ];

  // Stat Counters
  totalRequests: number = 8;
  pendingRequests: number = 2;
  approvedRequests: number = 5;
  rejectedRequests: number = 1;

  // Requests Data reflecting user-requested categories
  requestsList: EmployeeRequest[] = [
    {
      sNo: 1,
      requestId: 'REQ-2026-104',
      category: 'Hardware / Asset',
      subject: 'External 4K Monitor & USB-C Docking Station',
      description: 'Requesting a secondary display and dock for dual-screen frontend development and UI design review.',
      submittedDate: '21 Oct 2026',
      priority: 'High',
      assignedTo: 'IT Hardware Support',
      status: 'Pending',
    },
    {
      sNo: 2,
      requestId: 'REQ-2026-098',
      category: 'Promotion Request',
      subject: 'Senior Software Engineer to Lead Engineer Progression',
      description: 'Formal application for technical leadership promotion supported by H1 milestones and mentorship impact.',
      submittedDate: '19 Oct 2026',
      priority: 'High',
      assignedTo: 'Engineering VP & HR Head',
      status: 'In Progress',
    },
    {
      sNo: 3,
      requestId: 'REQ-2026-085',
      category: 'IT & System Access',
      subject: 'Production Cloud AWS & Kubernetes Cluster Access',
      description: 'Elevated role credentials required for microservice deployment debugging and incident triage.',
      submittedDate: '10 Oct 2026',
      priority: 'Urgent',
      assignedTo: 'DevOps & Security Ops',
      status: 'Approved',
    },
    {
      sNo: 4,
      requestId: 'REQ-2026-072',
      category: 'Department Transfer',
      subject: 'Internal Transfer Request to Core Architecture Team',
      description: 'Application for horizontal transfer from Feature Pod to Platform Engineering group for Q1 FY27.',
      submittedDate: '03 Oct 2026',
      priority: 'Medium',
      assignedTo: 'People Operations & HR Partner',
      status: 'Approved',
    },
    {
      sNo: 5,
      requestId: 'REQ-2026-061',
      category: 'Appraisal & Salary Review',
      subject: 'Annual Performance Appraisal Rating Clarification',
      description: 'Formal discussion request regarding annual compensation revision and market benchmark correction.',
      submittedDate: '26 Sep 2026',
      priority: 'High',
      assignedTo: 'Compensation & Benefits Lead',
      status: 'Pending',
    },
    {
      sNo: 6,
      requestId: 'REQ-2026-049',
      category: 'Hardware / Asset',
      subject: 'MacBook Pro M3 Max Upgrade for Mobile Builds',
      description: 'Hardware upgrade requested for running iOS simulators, Android emulators, and local Docker containers.',
      submittedDate: '14 Sep 2026',
      priority: 'Medium',
      assignedTo: 'IT Hardware Support',
      status: 'Approved',
    },
    {
      sNo: 7,
      requestId: 'REQ-2026-033',
      category: 'Expense Reimbursement',
      subject: 'Cloud Architect Certification Fee Reimbursement',
      description: 'Passed AWS Certified Solutions Architect Professional exam under employee skill growth policy.',
      submittedDate: '22 Aug 2026',
      priority: 'Low',
      assignedTo: 'Finance & Accounts',
      status: 'Approved',
    },
    {
      sNo: 8,
      requestId: 'REQ-2026-018',
      category: 'Resignation Request',
      subject: 'Separation Notice & Formal Handover Timeline',
      description: 'Formal transition schedule and knowledge-transfer document review with team lead.',
      submittedDate: '05 Aug 2026',
      priority: 'Low',
      assignedTo: 'Talent Management HR',
      status: 'Rejected',
    },
  ];

  get filteredRequests(): EmployeeRequest[] {
    return this.requestsList.filter((req) => {
      if (this.statusFilter !== 'ALL' && req.status.toUpperCase() !== this.statusFilter) {
        return false;
      }
      if (this.categoryFilter !== 'ALL' && req.category !== this.categoryFilter) {
        return false;
      }
      return true;
    });
  }

  clearFilters(): void {
    this.statusFilter = 'ALL';
    this.categoryFilter = 'ALL';
  }
}
