import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

import { EmployeeRequest } from '../../../core/models/request.interface';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { StatCards, StatMetric } from '../../../library/shared/components/stat-cards/stat-cards';
import {
  Badge,
  BadgeVariant,
  Button,
  Chip,
  InputDropdownOption,
  InputField,
  Pagination,
  Table,
  TableColumn,
  Toaster,
  ToasterService,
} from '../../../library/UI/components';

export type { EmployeeRequest } from '../../../core/models/request.interface';

export interface RequestFilterChip {
  key: 'search' | 'status' | 'category' | 'priority';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    StatCards,
    Button,
    InputField,
    Badge,
    Chip,
    Table,
    Pagination,
    Toaster,
  ],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css',
})
export class MyRequests implements OnInit {
  private http = inject(HttpClient);
  private toaster = inject(ToasterService);

  @ViewChild('requestIdTpl', { static: true }) requestIdTpl!: TemplateRef<any>;
  @ViewChild('categoryTpl', { static: true }) categoryTpl!: TemplateRef<any>;
  @ViewChild('subjectTpl', { static: true }) subjectTpl!: TemplateRef<any>;
  @ViewChild('priorityTpl', { static: true }) priorityTpl!: TemplateRef<any>;
  @ViewChild('submittedTpl', { static: true }) submittedTpl!: TemplateRef<any>;
  @ViewChild('assignedToTpl', { static: true }) assignedToTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];
  isLoadingRequests = false;

  // Draft Filter Inputs (bound to <app-input-field>)
  draftSearchTerm = '';
  draftStatusFilter = 'ALL';
  draftCategoryFilter = 'ALL';
  draftPriorityFilter = 'ALL';

  // Applied Filter State
  searchTerm = '';
  statusFilter = 'ALL';
  categoryFilter = 'ALL';
  priorityFilter = 'ALL';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  readonly availableCategories: string[] = [
    'Hardware / Asset',
    'IT & System Access',
    'Promotion Request',
    'Appraisal & Salary Review',
    'Department Transfer',
    'Resignation Request',
    'Work From Home',
    'Expense Reimbursement',
  ];

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'In Progress', value: 'IN PROGRESS' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  readonly categoryFilterOptions: InputDropdownOption[] = [
    { label: 'All Categories', value: 'ALL' },
    ...this.availableCategories.map((cat) => ({ label: cat, value: cat })),
  ];

  readonly priorityFilterOptions: InputDropdownOption[] = [
    { label: 'All Priorities', value: 'ALL' },
    { label: 'Urgent', value: 'Urgent' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  // Stat Counters
  totalRequests = 0;
  pendingRequests = 0;
  approvedRequests = 0;
  rejectedRequests = 0;

  // Cached Data & View State
  requestsList: EmployeeRequest[] = [];
  filteredRequests: EmployeeRequest[] = [];
  paginatedRequests: EmployeeRequest[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: RequestFilterChip[] = [];

  ngOnInit(): void {
    this.initTableColumns();
    this.updateRequestsView();
    this.loadMyRequests();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 70,
        minWidth: 70,
      },
      {
        field: 'requestId',
        headerName: 'Request ID',
        cellTemplate: this.requestIdTpl,
        width: 140,
        minWidth: 140,
      },
      {
        field: 'category',
        headerName: 'Category',
        cellTemplate: this.categoryTpl,
        width: 185,
        minWidth: 175,
      },
      {
        field: 'subject',
        headerName: 'Subject & Justification',
        cellTemplate: this.subjectTpl,
        width: 320,
        minWidth: 300,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        cellTemplate: this.priorityTpl,
        width: 115,
        minWidth: 110,
      },
      {
        field: 'submittedDate',
        headerName: 'Submitted',
        cellTemplate: this.submittedTpl,
        width: 135,
        minWidth: 130,
      },
      {
        field: 'assignedTo',
        headerName: 'Current Approver',
        cellTemplate: this.assignedToTpl,
        width: 220,
        minWidth: 200,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.statusTpl,
        width: 135,
        minWidth: 130,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.actionsTpl,
        width: 90,
        minWidth: 90,
      },
    ];
  }

  loadMyRequests(): void {
    this.isLoadingRequests = true;
    this.http
      .get<any[]>(API_ENDPOINTS.REQUESTS.BASE)
      .pipe(finalize(() => (this.isLoadingRequests = false)))
      .subscribe({
        next: (rows) => {
          this.requestsList = (rows || []).map((r, idx) => ({
            sNo: idx + 1,
            requestId: r.id || r.requestCode || r.requestId || `REQ-${idx + 101}`,
            category: (r.category || r.Category || 'IT & System Access') as EmployeeRequest['category'],
            subject: r.subject || r.Subject || 'Service Request',
            description: r.description || r.Description || '',
            submittedDate:
              r.submittedDate ||
              (r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null) ||
              new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
            priority: (r.priority || r.Priority || 'Medium') as EmployeeRequest['priority'],
            assignedTo:
              r.approvalChain?.find((s: any) => s.isCurrent)?.approverName ||
              r.approvalChain?.[0]?.approverName ||
              r.approvalChain?.[0]?.role ||
              'Department Manager / HR',
            status: (r.overallStatus || r.OverallStatus || r.status || 'Pending') as EmployeeRequest['status'],
            currentLevelNumber: Number(r.currentLevelNumber || r.CurrentLevelNumber || 1),
            totalLevels: Number(r.totalLevels || r.TotalLevels || r.approvalChain?.length || 1),
            approvalChain: Array.isArray(r.approvalChain)
              ? r.approvalChain.map((step: any, sIdx: number) => ({
                  levelNumber: Number(step.levelNumber || sIdx + 1),
                  levelTitle: step.levelTitle || `Level ${sIdx + 1}`,
                  role: step.role || 'Approver',
                  approverName: step.approverName || step.role || 'Approver',
                  approverId: step.approverId,
                  avatarColor: ['#10b981', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6'][sIdx % 7],
                  status: step.status || 'Pending',
                  actionDate: step.actionDate,
                  remarks: step.remarks,
                  isCurrent: !!step.isCurrent,
                  isFinalHR: !!step.isFinalHR,
                }))
              : [],
            details: r.details,
          }));
          this.updateRequestsView();
        },
        error: () => {
          this.requestsList = [];
          this.updateRequestsView();
        },
      });
  }

  private updateRequestsView(): void {
    this.totalRequests = this.requestsList.length;
    this.pendingRequests = this.requestsList.filter(
      (r) => r.status === 'Pending' || r.status === 'In Progress'
    ).length;
    this.approvedRequests = this.requestsList.filter((r) => r.status === 'Approved').length;
    this.rejectedRequests = this.requestsList.filter((r) => r.status === 'Rejected').length;

    this.statCards = [
      {
        title: 'Total Requests',
        value: `${this.totalRequests} Submissions`,
        subtitle: 'All raised service requests',
        badgeText: 'Total',
        badgeType: 'emerald',
        icon: 'bi-inbox-fill',
      },
      {
        title: 'Pending Requests',
        value: `${this.pendingRequests} Awaiting Action`,
        subtitle: 'In multi-stage review',
        badgeText: 'Pending',
        badgeType: 'warning',
        icon: 'bi-hourglass-split',
      },
      {
        title: 'Approved Requests',
        value: `${this.approvedRequests} Completed`,
        subtitle: 'Cleared by hierarchy',
        badgeText: 'Approved',
        badgeType: 'success',
        icon: 'bi-check2-circle',
      },
      {
        title: 'Rejected Requests',
        value: `${this.rejectedRequests} Declined`,
        subtitle: 'Closed with remarks',
        badgeText: 'Declined',
        badgeType: 'danger',
        icon: 'bi-x-circle',
      },
    ];

    const q = this.searchTerm.toLowerCase().trim();
    this.filteredRequests = this.requestsList.filter((req) => {
      if (this.statusFilter !== 'ALL' && req.status.toUpperCase() !== this.statusFilter) {
        return false;
      }
      if (this.categoryFilter !== 'ALL' && req.category !== this.categoryFilter) {
        return false;
      }
      if (this.priorityFilter !== 'ALL' && req.priority !== this.priorityFilter) {
        return false;
      }
      if (q) {
        const matchesQuery =
          req.requestId.toLowerCase().includes(q) ||
          req.category.toLowerCase().includes(q) ||
          req.subject.toLowerCase().includes(q) ||
          req.description.toLowerCase().includes(q) ||
          req.assignedTo.toLowerCase().includes(q) ||
          req.submittedDate.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      return true;
    });

    const totalPages = Math.max(1, Math.ceil(this.filteredRequests.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedRequests = this.filteredRequests
      .slice(start, start + this.pageSize)
      .map((req, idx) => ({
        ...req,
        sNo: start + idx + 1,
      }));

    const chips: RequestFilterChip[] = [];
    if (this.searchTerm.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.searchTerm.trim()}"`,
        icon: 'bi-search',
      });
    }
    if (this.statusFilter !== 'ALL') {
      chips.push({
        key: 'status',
        label: `Status: ${this.statusFilter}`,
        icon: 'bi-funnel',
      });
    }
    if (this.categoryFilter !== 'ALL') {
      chips.push({
        key: 'category',
        label: `Category: ${this.categoryFilter}`,
        icon: 'bi-tags',
      });
    }
    if (this.priorityFilter !== 'ALL') {
      chips.push({
        key: 'priority',
        label: `Priority: ${this.priorityFilter}`,
        icon: 'bi-flag',
      });
    }
    this.activeFilterChips = chips;
  }

  applyFilters(): void {
    this.searchTerm = this.draftSearchTerm.trim();
    this.statusFilter = this.draftStatusFilter || 'ALL';
    this.categoryFilter = this.draftCategoryFilter || 'ALL';
    this.priorityFilter = this.draftPriorityFilter || 'ALL';
    this.currentPage = 1;
    this.updateRequestsView();
  }

  clearFilters(): void {
    this.draftSearchTerm = '';
    this.draftStatusFilter = 'ALL';
    this.draftCategoryFilter = 'ALL';
    this.draftPriorityFilter = 'ALL';
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.categoryFilter = 'ALL';
    this.priorityFilter = 'ALL';
    this.currentPage = 1;
    this.updateRequestsView();
  }

  removeFilterChip(key: RequestFilterChip['key']): void {
    if (key === 'search') {
      this.draftSearchTerm = '';
      this.searchTerm = '';
    } else if (key === 'status') {
      this.draftStatusFilter = 'ALL';
      this.statusFilter = 'ALL';
    } else if (key === 'category') {
      this.draftCategoryFilter = 'ALL';
      this.categoryFilter = 'ALL';
    } else if (key === 'priority') {
      this.draftPriorityFilter = 'ALL';
      this.priorityFilter = 'ALL';
    }
    this.currentPage = 1;
    this.updateRequestsView();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateRequestsView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateRequestsView();
  }

  // Selected Request for Approval Workflow Dossier Modal
  selectedRequest: EmployeeRequest | null = null;

  openWorkflowModal(req: EmployeeRequest): void {
    this.selectedRequest = req;
  }

  closeWorkflowModal(): void {
    this.selectedRequest = null;
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getCategoryBadgeVariant(cat?: string): BadgeVariant {
    switch (cat) {
      case 'Resignation Request':
        return 'danger';
      case 'Promotion Request':
        return 'primary';
      case 'Appraisal & Salary Review':
        return 'soft-emerald';
      case 'Leave Request':
        return 'warning';
      case 'Hardware / Asset':
        return 'info';
      case 'IT & System Access':
        return 'secondary';
      default:
        return 'light';
    }
  }

  getStepBadgeVariant(status: string): BadgeVariant {
    switch (status) {
      case 'Approved':
        return 'soft-emerald';
      case 'Rejected':
        return 'danger';
      case 'Under Review':
        return 'soft-warning';
      default:
        return 'light';
    }
  }

  getCurrentApproverDisplay(req: EmployeeRequest): string {
    if (!req.approvalChain || req.approvalChain.length === 0) {
      return req.assignedTo || 'Department Manager / HR';
    }
    const current = req.approvalChain.find((s) => s.isCurrent);
    if (current) {
      return `${current.approverName} (${current.levelTitle})`;
    }
    if (req.status === 'Approved') return 'Completed (Final HR)';
    if (req.status === 'Rejected') return 'Declined';
    return req.approvalChain[0]?.approverName || 'Under Review';
  }

  copyRequestId(req: EmployeeRequest): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(req.requestId).catch(() => {});
    }
    this.toaster.success(`Request ID "${req.requestId}" copied to clipboard.`, 'Copied');
  }

  getPriorityBadgeVariant(priority?: string): BadgeVariant {
    switch (priority) {
      case 'Urgent':
      case 'High':
        return 'soft-danger';
      case 'Medium':
        return 'soft-warning';
      case 'Low':
        return 'light';
      default:
        return 'light';
    }
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Approved':
        return 'soft-success';
      case 'Pending':
        return 'soft-warning';
      case 'In Progress':
        return 'soft-info';
      case 'Rejected':
        return 'soft-danger';
      default:
        return 'light';
    }
  }
}
