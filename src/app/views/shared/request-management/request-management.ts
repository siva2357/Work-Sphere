import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService, ManagedRequest, ApprovalLevel } from '../../../core/services/request.service';
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

export interface RequestMgmtFilterChip {
  key: 'search' | 'status' | 'category' | 'priority' | 'sort';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './request-management.html',
  styleUrl: './request-management.css',
})
export class RequestManagement implements OnInit {
  private requestService = inject(RequestService);
  private toaster = inject(ToasterService);

  @ViewChild('sNoTpl', { static: true }) sNoTpl!: TemplateRef<any>;
  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<any>;
  @ViewChild('empIdTpl', { static: true }) empIdTpl!: TemplateRef<any>;
  @ViewChild('profileTpl', { static: true }) profileTpl!: TemplateRef<any>;
  @ViewChild('empNameTpl', { static: true }) empNameTpl!: TemplateRef<any>;
  @ViewChild('deptTpl', { static: true }) deptTpl!: TemplateRef<any>;
  @ViewChild('categoryTpl', { static: true }) categoryTpl!: TemplateRef<any>;
  @ViewChild('subjectTpl', { static: true }) subjectTpl!: TemplateRef<any>;
  @ViewChild('submittedDateTpl', { static: true }) submittedDateTpl!: TemplateRef<any>;
  @ViewChild('approvalStageTpl', { static: true }) approvalStageTpl!: TemplateRef<any>;
  @ViewChild('priorityTpl', { static: true }) priorityTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];

  // Draft Filter Inputs (bound to <app-input-field>)
  draftSearchQuery = '';
  draftStatus: 'ALL' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected' = 'ALL';
  draftCategory = 'ALL';
  draftPriority = 'ALL';
  draftSort: 'submittedDateDesc' | 'submittedDateAsc' | 'priority' | 'subjectAsc' | 'nameAsc' = 'submittedDateDesc';

  // Applied Filter State
  searchQuery = '';
  selectedStatus: 'ALL' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected' = 'ALL';
  selectedCategory = 'ALL';
  selectedPriority = 'ALL';
  selectedSort: 'submittedDateDesc' | 'submittedDateAsc' | 'priority' | 'subjectAsc' | 'nameAsc' = 'submittedDateDesc';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  readonly categories: string[] = [
    'Hardware / Asset',
    'IT & System Access',
    'Promotion Request',
    'Appraisal & Salary Review',
    'Department Transfer',
    'Resignation Request',
    'Work From Home',
    'Expense Reimbursement',
  ];

  // Filter Dropdown Options
  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'In Review / Pending', value: 'Under Review' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Declined', value: 'Rejected' },
  ];

  categoryFilterOptions: InputDropdownOption[] = [
    { label: 'All Categories', value: 'ALL' },
  ];

  readonly priorityFilterOptions: InputDropdownOption[] = [
    { label: 'All Priorities', value: 'ALL' },
    { label: 'Urgent Priority', value: 'Urgent' },
    { label: 'High Priority', value: 'High' },
    { label: 'Medium Priority', value: 'Medium' },
    { label: 'Low Priority', value: 'Low' },
  ];

  readonly sortFilterOptions: InputDropdownOption[] = [
    { label: 'Submitted: Newest First', value: 'submittedDateDesc' },
    { label: 'Submitted: Oldest First', value: 'submittedDateAsc' },
    { label: 'Priority: Highest First', value: 'priority' },
    { label: 'Subject: Alphabetical', value: 'subjectAsc' },
    { label: 'Employee Name: A-Z', value: 'nameAsc' },
  ];

  // Cached Arrays & Metrics
  requests: (ManagedRequest & { sNo?: number })[] = [];
  filteredRequests: (ManagedRequest & { sNo?: number })[] = [];
  paginatedRequests: (ManagedRequest & { sNo?: number })[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: RequestMgmtFilterChip[] = [];

  totalCount = 0;
  pendingReviewCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  // Selected Request for Modal Workflow Dossier
  selectedRequest: ManagedRequest | null = null;
  managerRemarks = '';
  viewingFormModal = false;

  ngOnInit(): void {
    this.initCategoryOptions();
    this.initTableColumns();
    this.updateRequestMgmtView();

    this.requestService.requests$.subscribe((list) => {
      this.requests = (list || []).map((r, idx) => ({
        ...r,
        sNo: idx + 1,
      }));
      this.updateRequestMgmtView();
      if (this.selectedRequest) {
        const updated = this.requests.find((r) => r.id === this.selectedRequest?.id);
        if (updated) this.selectedRequest = updated;
      }
    });

    this.requestService.refreshRequests();
  }

  private initCategoryOptions(): void {
    const opts: InputDropdownOption[] = [{ label: 'All Categories', value: 'ALL' }];
    this.categories.forEach((cat) => {
      opts.push({ label: cat, value: cat });
    });
    this.categoryFilterOptions = opts;
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 70,
        minWidth: 70,
        cellTemplate: this.sNoTpl,
      },
      {
        field: 'id',
        headerName: 'Request ID',
        width: 140,
        minWidth: 140,
        cellTemplate: this.idTpl,
      },
      {
        field: 'employeeId',
        headerName: 'Emp ID',
        width: 120,
        minWidth: 120,
        cellTemplate: this.empIdTpl,
      },
      {
        field: 'profile',
        headerName: 'Profile Image',
        width: 90,
        minWidth: 90,
        cellTemplate: this.profileTpl,
      },
      {
        field: 'employeeName',
        headerName: 'Employee Name',
        width: 210,
        minWidth: 200,
        cellTemplate: this.empNameTpl,
      },
      {
        field: 'department',
        headerName: 'Department',
        width: 200,
        minWidth: 190,
        cellTemplate: this.deptTpl,
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 190,
        minWidth: 180,
        cellTemplate: this.categoryTpl,
      },
      {
        field: 'subject',
        headerName: 'Subject',
        width: 320,
        minWidth: 300,
        cellTemplate: this.subjectTpl,
      },
      {
        field: 'submittedDate',
        headerName: 'Submitted On',
        width: 135,
        minWidth: 130,
        cellTemplate: this.submittedDateTpl,
      },
      {
        field: 'approvalStage',
        headerName: 'Current Stage',
        width: 330,
        minWidth: 310,
        cellTemplate: this.approvalStageTpl,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 115,
        minWidth: 110,
        cellTemplate: this.priorityTpl,
      },
      {
        field: 'overallStatus',
        headerName: 'Status',
        width: 135,
        minWidth: 130,
        cellTemplate: this.statusTpl,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 90,
        minWidth: 90,
        cellTemplate: this.actionsTpl,
      },
    ];
  }

  updateRequestMgmtView(): void {
    let result = [...this.requests];

    // 1. Status Filter
    if (this.selectedStatus !== 'ALL') {
      if (this.selectedStatus === 'Under Review') {
        result = result.filter((r) => r.overallStatus === 'Under Review' || r.overallStatus === 'Pending');
      } else {
        result = result.filter((r) => r.overallStatus === this.selectedStatus);
      }
    }

    // 2. Category Filter
    if (this.selectedCategory !== 'ALL') {
      result = result.filter((r) => r.category === this.selectedCategory);
    }

    // 3. Priority Filter
    if (this.selectedPriority !== 'ALL') {
      result = result.filter((r) => r.priority === this.selectedPriority);
    }

    // 4. Search Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeId.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (this.selectedSort) {
        case 'submittedDateDesc':
          return (b.submittedDate || '').localeCompare(a.submittedDate || '');
        case 'submittedDateAsc':
          return (a.submittedDate || '').localeCompare(b.submittedDate || '');
        case 'priority': {
          const order: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          return (order[b.priority] || 0) - (order[a.priority] || 0);
        }
        case 'subjectAsc':
          return a.subject.localeCompare(b.subject);
        case 'nameAsc':
          return a.employeeName.localeCompare(b.employeeName);
        default:
          return 0;
      }
    });

    this.filteredRequests = result;

    // Re-index S.No
    this.filteredRequests.forEach((r, idx) => {
      r.sNo = idx + 1;
    });

    // Metric Counts
    this.totalCount = this.requests.length;
    this.pendingReviewCount = this.requests.filter(
      (r) => r.overallStatus === 'Pending' || r.overallStatus === 'Under Review'
    ).length;
    this.approvedCount = this.requests.filter((r) => r.overallStatus === 'Approved').length;
    this.rejectedCount = this.requests.filter((r) => r.overallStatus === 'Rejected').length;

    // Update Stat Cards
    this.statCards = [
      {
        title: 'Total Submissions',
        value: this.totalCount,
        subtitle: 'Multi-stage approval queue',
        icon: 'bi-inbox-fill',
        badgeText: 'ALL CATEGORIES',
        badgeType: 'secondary',
      },
      {
        title: 'Pending Review',
        value: this.pendingReviewCount,
        subtitle: 'Awaiting stage sign-off',
        icon: 'bi-hourglass-split',
        badgeText: 'ACTION REQUIRED',
        badgeType: 'warning',
      },
      {
        title: 'Approved Requests',
        value: this.approvedCount,
        subtitle: 'Cleared by hierarchy',
        icon: 'bi-check-circle-fill',
        badgeText: 'APPROVED',
        badgeType: 'emerald',
      },
      {
        title: 'Declined Requests',
        value: this.rejectedCount,
        subtitle: 'Returned with rationale',
        icon: 'bi-x-circle-fill',
        badgeText: 'DECLINED',
        badgeType: 'danger',
      },
    ];

    // Build Active Filter Chips
    this.buildFilterChips();

    // Paginate
    const maxPage = Math.max(1, Math.ceil(this.filteredRequests.length / this.pageSize));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    this.effectiveCurrentPage = this.currentPage;

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedRequests = this.filteredRequests.slice(start, start + this.pageSize);
  }

  private buildFilterChips(): void {
    const chips: RequestMgmtFilterChip[] = [];

    if (this.searchQuery.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.searchQuery.trim()}"`,
        icon: 'bi-search',
      });
    }

    if (this.selectedStatus !== 'ALL') {
      chips.push({
        key: 'status',
        label: `Status: ${this.selectedStatus === 'Under Review' ? 'In Review' : this.selectedStatus}`,
        icon: 'bi-check2-circle',
      });
    }

    if (this.selectedCategory !== 'ALL') {
      chips.push({
        key: 'category',
        label: `Category: ${this.selectedCategory}`,
        icon: 'bi-tag',
      });
    }

    if (this.selectedPriority !== 'ALL') {
      chips.push({
        key: 'priority',
        label: `Priority: ${this.selectedPriority}`,
        icon: 'bi-flag-fill',
      });
    }

    if (this.selectedSort !== 'submittedDateDesc') {
      const match = this.sortFilterOptions.find((o) => o.value === this.selectedSort);
      if (match) {
        chips.push({
          key: 'sort',
          label: `Sort: ${match.label}`,
          icon: 'bi-sort-down',
        });
      }
    }

    this.activeFilterChips = chips;
  }

  applyFilters(): void {
    this.searchQuery = this.draftSearchQuery;
    this.selectedStatus = this.draftStatus;
    this.selectedCategory = this.draftCategory;
    this.selectedPriority = this.draftPriority;
    this.selectedSort = this.draftSort;
    this.currentPage = 1;
    this.updateRequestMgmtView();
    this.toaster.show({
      title: 'Filters Applied',
      message: `Showing ${this.filteredRequests.length} matching corporate requests.`,
      variant: 'info',
      icon: 'bi-funnel-fill',
    });
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftStatus = 'ALL';
    this.draftCategory = 'ALL';
    this.draftPriority = 'ALL';
    this.draftSort = 'submittedDateDesc';

    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedCategory = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedSort = 'submittedDateDesc';

    this.currentPage = 1;
    this.updateRequestMgmtView();
    this.toaster.show({
      title: 'Filters Reset',
      message: 'All request directory filters restored to defaults.',
      variant: 'info',
      icon: 'bi-arrow-counterclockwise',
    });
  }

  removeFilter(key: RequestMgmtFilterChip['key']): void {
    switch (key) {
      case 'search':
        this.draftSearchQuery = '';
        this.searchQuery = '';
        break;
      case 'status':
        this.draftStatus = 'ALL';
        this.selectedStatus = 'ALL';
        break;
      case 'category':
        this.draftCategory = 'ALL';
        this.selectedCategory = 'ALL';
        break;
      case 'priority':
        this.draftPriority = 'ALL';
        this.selectedPriority = 'ALL';
        break;
      case 'sort':
        this.draftSort = 'submittedDateDesc';
        this.selectedSort = 'submittedDateDesc';
        break;
    }
    this.currentPage = 1;
    this.updateRequestMgmtView();
  }

  setStatusTab(status: 'ALL' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected'): void {
    this.draftStatus = status;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.updateRequestMgmtView();
  }

  // Workflow Approver Display Helper
  getCurrentApproverDisplay(req: ManagedRequest): string {
    const current = req.approvalChain.find((l) => l.isCurrent);
    if (current) {
      return `${current.approverName} (${current.levelTitle})`;
    }
    if (req.overallStatus === 'Approved') {
      return 'Completed (Final HR)';
    }
    if (req.overallStatus === 'Rejected') {
      return 'Declined';
    }
    return 'HR Operations';
  }

  // Manager Approval & Rejection Handlers
  approveRequest(req: ManagedRequest, remarks?: string): void {
    const result = this.requestService.approveCurrentLevel(req.id, remarks || this.managerRemarks);
    if (result.success) {
      this.managerRemarks = '';
      this.updateRequestMgmtView();
      this.toaster.show({
        title: result.isFinal ? 'Request Fully Approved' : 'Stage Approved',
        message: result.message,
        variant: 'emerald',
        icon: 'bi-check-circle-fill',
      });
      if (this.selectedRequest?.id === req.id) {
        const updated = this.requests.find((r) => r.id === req.id);
        if (updated) this.selectedRequest = updated;
      }
    }
  }

  rejectRequest(req: ManagedRequest, remarks?: string): void {
    const success = this.requestService.rejectCurrentLevel(req.id, remarks || this.managerRemarks);
    if (success) {
      this.managerRemarks = '';
      this.updateRequestMgmtView();
      this.toaster.show({
        title: 'Request Declined',
        message: `Request ${req.id} has been declined.`,
        variant: 'danger',
        icon: 'bi-x-circle-fill',
      });
      if (this.selectedRequest?.id === req.id) {
        const updated = this.requests.find((r) => r.id === req.id);
        if (updated) this.selectedRequest = updated;
      }
    }
  }

  // Modal Review Dossier Handlers
  openWorkflowModal(req: ManagedRequest): void {
    this.selectedRequest = req;
    this.managerRemarks = '';
    this.viewingFormModal = false;
  }

  closeWorkflowModal(): void {
    this.selectedRequest = null;
    this.managerRemarks = '';
    this.viewingFormModal = false;
  }

  confirmModalApprove(): void {
    if (this.selectedRequest) {
      this.approveRequest(this.selectedRequest, this.managerRemarks);
    }
  }

  confirmModalReject(): void {
    if (this.selectedRequest) {
      this.rejectRequest(this.selectedRequest, this.managerRemarks);
    }
  }

  // Pagination Handlers
  onPageChange(page: number): void {
    this.currentPage = page;
    this.effectiveCurrentPage = page;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedRequests = this.filteredRequests.slice(start, start + this.pageSize);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.effectiveCurrentPage = 1;
    this.updateRequestMgmtView();
  }

  // Variant Helpers
  getCategoryBadgeVariant(category: string): BadgeVariant {
    switch (category) {
      case 'Hardware / Asset':
        return 'soft-primary';
      case 'Promotion Request':
        return 'soft-emerald';
      case 'IT & System Access':
        return 'soft-danger';
      case 'Appraisal & Salary Review':
        return 'soft-warning';
      case 'Department Transfer':
        return 'soft-info';
      case 'Resignation Request':
        return 'soft-secondary';
      case 'Work From Home':
        return 'soft-emerald';
      case 'Expense Reimbursement':
        return 'soft-primary';
      default:
        return 'light';
    }
  }

  getStatusBadgeVariant(status: string): BadgeVariant {
    switch (status) {
      case 'Approved':
        return 'soft-emerald';
      case 'Under Review':
        return 'soft-info';
      case 'Pending':
        return 'soft-warning';
      case 'Rejected':
        return 'soft-danger';
      default:
        return 'light';
    }
  }

  getPriorityBadgeVariant(priority: string): BadgeVariant {
    switch (priority) {
      case 'Urgent':
        return 'soft-danger';
      case 'High':
        return 'soft-warning';
      case 'Medium':
        return 'soft-primary';
      case 'Low':
        return 'light';
      default:
        return 'light';
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'REQ';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
}
