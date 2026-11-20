import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, EmployeeLeaveProposal } from '../../../core/services/leave.service';
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

export interface LeaveMgmtFilterChip {
  key: 'search' | 'status' | 'type' | 'department' | 'sort';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-leave-management',
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
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.css',
})
export class LeaveManagement implements OnInit {
  private leaveService = inject(LeaveService);
  private toaster = inject(ToasterService);

  @ViewChild('sNoTpl', { static: true }) sNoTpl!: TemplateRef<any>;
  @ViewChild('requestIdTpl', { static: true }) requestIdTpl!: TemplateRef<any>;
  @ViewChild('empIdTpl', { static: true }) empIdTpl!: TemplateRef<any>;
  @ViewChild('profileTpl', { static: true }) profileTpl!: TemplateRef<any>;
  @ViewChild('empNameTpl', { static: true }) empNameTpl!: TemplateRef<any>;
  @ViewChild('deptTpl', { static: true }) deptTpl!: TemplateRef<any>;
  @ViewChild('leaveTypeTpl', { static: true }) leaveTypeTpl!: TemplateRef<any>;
  @ViewChild('durationTpl', { static: true }) durationTpl!: TemplateRef<any>;
  @ViewChild('daysTpl', { static: true }) daysTpl!: TemplateRef<any>;
  @ViewChild('reasonTpl', { static: true }) reasonTpl!: TemplateRef<any>;
  @ViewChild('appliedDateTpl', { static: true }) appliedDateTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];

  // Draft Filter Inputs (bound to <app-input-field>)
  draftSearchQuery = '';
  draftStatus: 'ALL' | 'Pending' | 'Approved' | 'Rejected' = 'ALL';
  draftType = 'ALL';
  draftDepartment = 'ALL';
  draftSort = 'appliedDateDesc';

  // Applied Filter State
  searchQuery = '';
  selectedStatus: 'ALL' | 'Pending' | 'Approved' | 'Rejected' = 'ALL';
  selectedType = 'ALL';
  selectedDepartment = 'ALL';
  selectedSort = 'appliedDateDesc';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  // Filter Dropdown Options
  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Pending Approval', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Declined', value: 'Rejected' },
  ];

  readonly typeFilterOptions: InputDropdownOption[] = [
    { label: 'All Leave Categories', value: 'ALL' },
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Earned Leave', value: 'Earned Leave' },
    { label: 'Comp-Off', value: 'Comp-Off' },
    { label: 'Annual Vacation', value: 'Annual Vacation' },
  ];

  departmentFilterOptions: InputDropdownOption[] = [
    { label: 'All Departments', value: 'ALL' },
  ];

  readonly sortFilterOptions: InputDropdownOption[] = [
    { label: 'Applied Date: Newest First', value: 'appliedDateDesc' },
    { label: 'Applied Date: Oldest First', value: 'appliedDateAsc' },
    { label: 'Duration: Most Days First', value: 'daysDesc' },
    { label: 'Duration: Least Days First', value: 'daysAsc' },
    { label: 'Employee Name: A-Z', value: 'nameAsc' },
  ];

  // Cached Arrays & Metrics
  proposals: (EmployeeLeaveProposal & { sNo?: number })[] = [];
  filteredProposals: (EmployeeLeaveProposal & { sNo?: number })[] = [];
  paginatedProposals: (EmployeeLeaveProposal & { sNo?: number })[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: LeaveMgmtFilterChip[] = [];

  totalCount = 0;
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  // Modal Review State
  selectedProposal: EmployeeLeaveProposal | null = null;
  managerReviewComment = '';

  ngOnInit(): void {
    this.initTableColumns();
    this.updateLeaveMgmtView();

    this.leaveService.proposals$.subscribe((list) => {
      this.proposals = (list || []).map((p, idx) => ({
        ...p,
        sNo: idx + 1,
      }));
      this.extractDepartments();
      this.updateLeaveMgmtView();
    });

    this.leaveService.refreshProposals();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 75,
        cellTemplate: this.sNoTpl,
      },
      {
        field: 'id',
        headerName: 'Request ID',
        width: 130,
        cellTemplate: this.requestIdTpl,
      },
      {
        field: 'employeeId',
        headerName: 'Emp ID',
        width: 110,
        cellTemplate: this.empIdTpl,
      },
      {
        field: 'avatar',
        headerName: 'Profile Image',
        width: 120,
        cellTemplate: this.profileTpl,
      },
      {
        field: 'employeeName',
        headerName: 'Full Name',
        width: 180,
        cellTemplate: this.empNameTpl,
      },
      {
        field: 'department',
        headerName: 'Department',
        width: 190,
        cellTemplate: this.deptTpl,
      },
      {
        field: 'leaveType',
        headerName: 'Leave Type',
        width: 140,
        cellTemplate: this.leaveTypeTpl,
      },
      {
        field: 'duration',
        headerName: 'Leave Duration',
        width: 180,
        cellTemplate: this.durationTpl,
      },
      {
        field: 'days',
        headerName: 'Days',
        width: 90,
        cellTemplate: this.daysTpl,
      },
      {
        field: 'reason',
        headerName: 'Reason & Context',
        width: 240,
        cellTemplate: this.reasonTpl,
      },
      {
        field: 'appliedDate',
        headerName: 'Applied On',
        width: 125,
        cellTemplate: this.appliedDateTpl,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 125,
        cellTemplate: this.statusTpl,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 90,
        cellTemplate: this.actionsTpl,
      },
    ];
  }

  private extractDepartments(): void {
    const set = new Set<string>();
    this.proposals.forEach((p) => {
      if (p.department) set.add(p.department);
    });

    const opts: InputDropdownOption[] = [{ label: 'All Departments', value: 'ALL' }];
    Array.from(set).sort().forEach((dept) => {
      opts.push({ label: dept, value: dept });
    });
    this.departmentFilterOptions = opts;
  }

  updateLeaveMgmtView(): void {
    let result = [...this.proposals];

    // 1. Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((p) => p.status === this.selectedStatus);
    }

    // 2. Type Filter
    if (this.selectedType !== 'ALL') {
      result = result.filter((p) => p.leaveType === this.selectedType);
    }

    // 3. Department Filter
    if (this.selectedDepartment !== 'ALL') {
      result = result.filter((p) => p.department === this.selectedDepartment);
    }

    // 4. Search Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.employeeId.toLowerCase().includes(q) ||
          p.employeeName.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.leaveType.toLowerCase().includes(q) ||
          p.reason.toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (this.selectedSort) {
        case 'appliedDateAsc':
          return (a.appliedDate || '').localeCompare(b.appliedDate || '');
        case 'appliedDateDesc':
          return (b.appliedDate || '').localeCompare(a.appliedDate || '');
        case 'daysDesc':
          return (b.days || 0) - (a.days || 0);
        case 'daysAsc':
          return (a.days || 0) - (b.days || 0);
        case 'nameAsc':
          return a.employeeName.localeCompare(b.employeeName);
        default:
          return 0;
      }
    });

    this.filteredProposals = result;

    // Re-index S.No
    this.filteredProposals.forEach((item, index) => {
      item.sNo = index + 1;
    });

    // Metric Counts
    this.totalCount = this.proposals.length;
    this.pendingCount = this.proposals.filter((p) => p.status === 'Pending').length;
    this.approvedCount = this.proposals.filter((p) => p.status === 'Approved').length;
    this.rejectedCount = this.proposals.filter((p) => p.status === 'Rejected').length;

    // Update Stat Cards
    this.statCards = [
      {
        title: 'Total Proposals',
        value: this.totalCount,
        subtitle: 'Submitted by team',
        icon: 'bi-calendar2-range-fill',
        badgeText: 'TEAM',
        badgeType: 'secondary',
      },
      {
        title: 'Pending Approval',
        value: this.pendingCount,
        subtitle: 'Requires manager action',
        icon: 'bi-hourglass-split',
        badgeText: 'ACTION REQUIRED',
        badgeType: 'warning',
      },
      {
        title: 'Approved Leaves',
        value: this.approvedCount,
        subtitle: 'Granted by manager',
        icon: 'bi-check-circle-fill',
        badgeText: 'APPROVED',
        badgeType: 'emerald',
      },
      {
        title: 'Declined Proposals',
        value: this.rejectedCount,
        subtitle: 'Schedule conflicts',
        icon: 'bi-x-circle-fill',
        badgeText: 'DECLINED',
        badgeType: 'danger',
      },
    ];

    // Update Filter Chips
    this.buildFilterChips();

    // Paginate
    const maxPage = Math.max(1, Math.ceil(this.filteredProposals.length / this.pageSize));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    this.effectiveCurrentPage = this.currentPage;

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedProposals = this.filteredProposals.slice(start, start + this.pageSize);
  }

  private buildFilterChips(): void {
    const chips: LeaveMgmtFilterChip[] = [];

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
        label: `Status: ${this.selectedStatus}`,
        icon: 'bi-check2-circle',
      });
    }

    if (this.selectedType !== 'ALL') {
      chips.push({
        key: 'type',
        label: `Type: ${this.selectedType}`,
        icon: 'bi-tag',
      });
    }

    if (this.selectedDepartment !== 'ALL') {
      chips.push({
        key: 'department',
        label: `Dept: ${this.selectedDepartment}`,
        icon: 'bi-building',
      });
    }

    if (this.selectedSort !== 'appliedDateDesc') {
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
    this.selectedType = this.draftType;
    this.selectedDepartment = this.draftDepartment;
    this.selectedSort = this.draftSort;
    this.currentPage = 1;
    this.updateLeaveMgmtView();
    this.toaster.show({
      title: 'Filters Applied',
      message: `Showing ${this.filteredProposals.length} matching leave proposals.`,
      variant: 'info',
      icon: 'bi-funnel-fill',
    });
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftStatus = 'ALL';
    this.draftType = 'ALL';
    this.draftDepartment = 'ALL';
    this.draftSort = 'appliedDateDesc';

    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedType = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedSort = 'appliedDateDesc';

    this.currentPage = 1;
    this.updateLeaveMgmtView();
    this.toaster.show({
      title: 'Filters Reset',
      message: 'All leave proposal filters restored to defaults.',
      variant: 'info',
      icon: 'bi-arrow-counterclockwise',
    });
  }

  removeFilter(key: LeaveMgmtFilterChip['key']): void {
    switch (key) {
      case 'search':
        this.draftSearchQuery = '';
        this.searchQuery = '';
        break;
      case 'status':
        this.draftStatus = 'ALL';
        this.selectedStatus = 'ALL';
        break;
      case 'type':
        this.draftType = 'ALL';
        this.selectedType = 'ALL';
        break;
      case 'department':
        this.draftDepartment = 'ALL';
        this.selectedDepartment = 'ALL';
        break;
      case 'sort':
        this.draftSort = 'appliedDateDesc';
        this.selectedSort = 'appliedDateDesc';
        break;
    }
    this.currentPage = 1;
    this.updateLeaveMgmtView();
  }

  setStatusTab(status: 'ALL' | 'Pending' | 'Approved' | 'Rejected'): void {
    this.draftStatus = status;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.updateLeaveMgmtView();
  }

  // Manager Actions
  approve(proposal: EmployeeLeaveProposal, comments?: string): void {
    const success = this.leaveService.approveProposal(proposal.id, comments);
    if (success) {
      this.updateLeaveMgmtView();
      this.toaster.show({
        title: 'Proposal Approved',
        message: `Leave proposal for ${proposal.employeeName} (${proposal.days}d ${proposal.leaveType}) approved!`,
        variant: 'emerald',
        icon: 'bi-check-circle-fill',
      });
    }
  }

  reject(proposal: EmployeeLeaveProposal, comments?: string): void {
    const success = this.leaveService.rejectProposal(proposal.id, comments);
    if (success) {
      this.updateLeaveMgmtView();
      this.toaster.show({
        title: 'Proposal Declined',
        message: `Leave proposal for ${proposal.employeeName} has been declined.`,
        variant: 'danger',
        icon: 'bi-x-circle-fill',
      });
    }
  }

  approveAllPending(): void {
    const count = this.leaveService.approveAllPending();
    if (count > 0) {
      this.updateLeaveMgmtView();
      this.toaster.show({
        title: 'Batch Approvals',
        message: `Successfully approved all ${count} pending leave proposals!`,
        variant: 'emerald',
        icon: 'bi-check-all',
      });
    } else {
      this.toaster.show({
        title: 'No Pending Proposals',
        message: 'There are no pending leave proposals to approve at this time.',
        variant: 'info',
        icon: 'bi-info-circle',
      });
    }
  }

  // Modal Review
  openReviewModal(proposal: EmployeeLeaveProposal): void {
    this.selectedProposal = proposal;
    this.managerReviewComment = proposal.managerComments || '';
  }

  closeReviewModal(): void {
    this.selectedProposal = null;
    this.managerReviewComment = '';
  }

  confirmModalApprove(): void {
    if (this.selectedProposal) {
      this.approve(this.selectedProposal, this.managerReviewComment);
      this.closeReviewModal();
    }
  }

  confirmModalReject(): void {
    if (this.selectedProposal) {
      this.reject(this.selectedProposal, this.managerReviewComment);
      this.closeReviewModal();
    }
  }

  // Pagination Handlers
  onPageChange(page: number): void {
    this.currentPage = page;
    this.effectiveCurrentPage = page;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedProposals = this.filteredProposals.slice(start, start + this.pageSize);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.effectiveCurrentPage = 1;
    this.updateLeaveMgmtView();
  }

  // Variant Helpers
  getStatusBadgeVariant(status: string): BadgeVariant {
    switch (status) {
      case 'Approved':
        return 'soft-emerald';
      case 'Pending':
        return 'soft-warning';
      case 'Rejected':
        return 'soft-danger';
      default:
        return 'light';
    }
  }

  getTypeBadgeVariant(type: string): BadgeVariant {
    switch (type) {
      case 'Casual Leave':
        return 'soft-emerald';
      case 'Sick Leave':
        return 'soft-info';
      case 'Earned Leave':
        return 'soft-primary';
      case 'Comp-Off':
        return 'soft-secondary';
      case 'Annual Vacation':
        return 'soft-warning';
      default:
        return 'light';
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'EMP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
}
