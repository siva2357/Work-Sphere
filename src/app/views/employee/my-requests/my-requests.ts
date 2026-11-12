import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { EmployeeRequest } from '../../../core/models/request.interface';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';

export type { EmployeeRequest } from '../../../core/models/request.interface';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css',
})
export class MyRequests implements OnInit {
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
  totalRequests: number = 0;
  pendingRequests: number = 0;
  approvedRequests: number = 0;
  rejectedRequests: number = 0;

  // Real-time Employee Requests from Backend Database
  requestsList: EmployeeRequest[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadMyRequests();
  }

  loadMyRequests(): void {
    this.http.get<any[]>(API_ENDPOINTS.REQUESTS.BASE).subscribe({
      next: (rows) => {
        this.requestsList = (rows || []).map((r, idx) => ({
          sNo: idx + 1,
          requestId: r.requestId || `REQ-${idx + 101}`,
          category: (r.category || 'IT & System Access') as EmployeeRequest['category'],
          subject: r.subject || 'Service Request',
          description: r.description || '',
          submittedDate: r.submittedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          priority: (r.priority || 'Medium') as EmployeeRequest['priority'],
          assignedTo: r.approvalChain?.[0]?.approverRole || 'Department Manager / HR',
          status: (r.status || 'Pending') as EmployeeRequest['status']
        }));
        this.totalRequests = this.requestsList.length;
        this.pendingRequests = this.requestsList.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
        this.approvedRequests = this.requestsList.filter(r => r.status === 'Approved').length;
        this.rejectedRequests = this.requestsList.filter(r => r.status === 'Rejected').length;
      },
      error: () => {
        this.requestsList = [];
      }
    });
  }

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
