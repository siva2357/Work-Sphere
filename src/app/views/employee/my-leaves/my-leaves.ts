import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  LeaveBalance,
  LeaveRecord,
  UpcomingHoliday,
} from '../../../core/models/leave.interface';
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
} from '../../../library/UI/components';

export type { LeaveBalance, LeaveRecord, UpcomingHoliday };

export interface LeaveFilterChip {
  key: 'search' | 'status' | 'type';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-my-leaves',
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
  ],
  templateUrl: './my-leaves.html',
  styleUrl: './my-leaves.css',
})
export class MyLeaves implements OnInit {
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);

  @ViewChild('leaveTypeTpl', { static: true }) leaveTypeTpl!: TemplateRef<any>;
  @ViewChild('fromDateTpl', { static: true }) fromDateTpl!: TemplateRef<any>;
  @ViewChild('toDateTpl', { static: true }) toDateTpl!: TemplateRef<any>;
  @ViewChild('daysTpl', { static: true }) daysTpl!: TemplateRef<any>;
  @ViewChild('reasonTpl', { static: true }) reasonTpl!: TemplateRef<any>;
  @ViewChild('appliedDateTpl', { static: true }) appliedDateTpl!: TemplateRef<any>;
  @ViewChild('approvedByTpl', { static: true }) approvedByTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];
  isLoadingLeaves = false;

  currentMonth = 'October 2026';
  readonly availableMonths: string[] = [
    'October 2026',
    'September 2026',
    'August 2026',
    'July 2026',
    'June 2026',
    'May 2026',
    'April 2026',
    'March 2026',
    'February 2026',
    'January 2026',
  ];

  // Draft Filter Inputs
  draftSearchTerm = '';
  draftStatusFilter = 'ALL';
  draftTypeFilter = 'ALL';

  // Applied Filter State
  searchTerm = '';
  statusFilter = 'ALL';
  typeFilter = 'ALL';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  readonly typeFilterOptions: InputDropdownOption[] = [
    { label: 'All Leave Types', value: 'ALL' },
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Earned Leave', value: 'Earned Leave' },
    { label: 'Comp-Off', value: 'Comp-Off' },
  ];

  appliedLeaves = 0;
  pendingLeaves = 0;
  approvedLeaves = 0;
  rejectedLeaves = 0;
  earnedLeaves = 0;
  paidLeaves = 0;

  statCards: StatMetric[] = [];
  leaveBalances: LeaveBalance[] = [];
  upcomingHolidays: UpcomingHoliday[] = [];
  leaveRecords: LeaveRecord[] = [];
  filteredLeaveRecords: LeaveRecord[] = [];
  paginatedLeaveRecords: LeaveRecord[] = [];
  activeFilterChips: LeaveFilterChip[] = [];

  ngOnInit(): void {
    this.initTableColumns();
    this.rebuildStatCards();
    this.loadMyLeaves();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 70,
      },
      {
        field: 'leaveType',
        headerName: 'Leave Type',
        cellTemplate: this.leaveTypeTpl,
        width: 140,
      },
      {
        field: 'fromDate',
        headerName: 'From',
        cellTemplate: this.fromDateTpl,
        width: 120,
      },
      {
        field: 'toDate',
        headerName: 'To',
        cellTemplate: this.toDateTpl,
        width: 120,
      },
      {
        field: 'days',
        headerName: 'Days',
        cellTemplate: this.daysTpl,
        width: 100,
      },
      {
        field: 'reason',
        headerName: 'Reason',
        cellTemplate: this.reasonTpl,
        width: 220,
      },
      {
        field: 'appliedDate',
        headerName: 'Applied Date',
        cellTemplate: this.appliedDateTpl,
        width: 125,
      },
      {
        field: 'approvedBy',
        headerName: 'Approved By',
        cellTemplate: this.approvedByTpl,
        width: 145,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.statusTpl,
        width: 125,
      },
    ];
  }

  private loadMyLeaves(): void {
    this.isLoadingLeaves = true;
    const empCode = this.authService.getCurrentEmployeeCode();

    this.leaveService
      .fetchMyLeaves$(empCode)
      .pipe(finalize(() => (this.isLoadingLeaves = false)))
      .subscribe((res: any) => {
        if (Array.isArray(res?.balances)) {
          this.leaveBalances = res.balances.map((b: any) => ({
            type: b.leaveType || 'Casual Leave',
            shortCode: b.shortCode || 'CL',
            used: Number(b.used ?? 0),
            total: Number(b.totalAllocated ?? 12),
            available: Number(b.available ?? 12),
            colorClass: b.colorClass || 'bg-emerald',
          }));

          const el = this.leaveBalances.find((b) => b.shortCode === 'EL');
          if (el) {
            this.earnedLeaves = el.available;
          }
          this.paidLeaves = this.leaveBalances.reduce((acc, b) => acc + b.available, 0);
        }

        if (Array.isArray(res?.upcomingHolidays)) {
          this.upcomingHolidays = res.upcomingHolidays;
        }

        if (Array.isArray(res?.leaveHistory)) {
          this.leaveRecords = res.leaveHistory.map((h: any, idx: number) => ({
            sNo: idx + 1,
            leaveType: (h.leaveType as LeaveRecord['leaveType']) || 'Casual Leave',
            fromDate: h.fromDate || '',
            toDate: h.toDate || '',
            days: Number(h.daysCount ?? 1),
            month: h.month || 'October 2026',
            reason: h.reason || '',
            appliedDate: h.appliedDate || '',
            approvedBy: h.approvedBy || 'Manager',
            status: (h.status as LeaveRecord['status']) || 'Pending',
          }));
        }

        this.updateStatsForMonth();
        this.updateLeavesView();
      });
  }

  private rebuildStatCards(): void {
    this.statCards = [
      {
        title: 'Applied Leaves',
        value: `${this.appliedLeaves} Days`,
        subtitle: 'Submitted this cycle',
        badgeText: 'Applied',
        badgeType: 'emerald',
        icon: 'bi-calendar-plus',
      },
      {
        title: 'Pending Leaves',
        value: `${this.pendingLeaves} Days`,
        subtitle: 'Awaiting approval',
        badgeText: 'Pending',
        badgeType: 'warning',
        icon: 'bi-hourglass-split',
      },
      {
        title: 'Approved Leaves',
        value: `${this.approvedLeaves} Days`,
        subtitle: 'Sanctioned time-off',
        badgeText: 'Approved',
        badgeType: 'success',
        icon: 'bi-calendar-check',
      },
      {
        title: 'Rejected Leaves',
        value: `${this.rejectedLeaves} Days`,
        subtitle: 'Declined requests',
        badgeText: 'Declined',
        badgeType: 'danger',
        icon: 'bi-x-circle',
      },
      {
        title: 'Earned Leaves',
        value: `${this.earnedLeaves} Days`,
        subtitle: 'Accrued balance',
        badgeText: 'Earned',
        badgeType: 'info',
        icon: 'bi-award',
      },
      {
        title: 'Paid Leaves',
        value: `${this.paidLeaves} Days`,
        subtitle: 'Total available quota',
        badgeText: 'Available',
        badgeType: 'emerald',
        icon: 'bi-wallet2',
      },
    ];
  }

  private updateLeavesView(): void {
    const q = this.searchTerm.toLowerCase().trim();
    this.filteredLeaveRecords = this.leaveRecords.filter((rec) => {
      if (this.currentMonth && rec.month && rec.month !== this.currentMonth) {
        return false;
      }
      if (this.statusFilter !== 'ALL' && rec.status.toUpperCase() !== this.statusFilter) {
        return false;
      }
      if (this.typeFilter !== 'ALL' && rec.leaveType !== this.typeFilter) {
        return false;
      }
      if (q) {
        const matchesQuery =
          rec.leaveType.toLowerCase().includes(q) ||
          rec.reason.toLowerCase().includes(q) ||
          rec.fromDate.toLowerCase().includes(q) ||
          rec.toDate.toLowerCase().includes(q) ||
          rec.appliedDate.toLowerCase().includes(q) ||
          rec.approvedBy.toLowerCase().includes(q) ||
          rec.status.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      return true;
    });

    const totalPages = Math.max(1, Math.ceil(this.filteredLeaveRecords.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedLeaveRecords = this.filteredLeaveRecords
      .slice(start, start + this.pageSize)
      .map((rec, idx) => ({
        ...rec,
        sNo: start + idx + 1,
      }));

    const chips: LeaveFilterChip[] = [];
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
    if (this.typeFilter !== 'ALL') {
      chips.push({
        key: 'type',
        label: `Type: ${this.typeFilter}`,
        icon: 'bi-calendar2-week',
      });
    }
    this.activeFilterChips = chips;
  }

  applyFilters(): void {
    this.searchTerm = this.draftSearchTerm.trim();
    this.statusFilter = this.draftStatusFilter || 'ALL';
    this.typeFilter = this.draftTypeFilter || 'ALL';
    this.currentPage = 1;
    this.updateLeavesView();
  }

  clearFilters(): void {
    this.draftSearchTerm = '';
    this.draftStatusFilter = 'ALL';
    this.draftTypeFilter = 'ALL';
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.currentPage = 1;
    this.updateLeavesView();
  }

  removeFilterChip(key: LeaveFilterChip['key']): void {
    if (key === 'search') {
      this.draftSearchTerm = '';
      this.searchTerm = '';
    } else if (key === 'status') {
      this.draftStatusFilter = 'ALL';
      this.statusFilter = 'ALL';
    } else if (key === 'type') {
      this.draftTypeFilter = 'ALL';
      this.typeFilter = 'ALL';
    }
    this.currentPage = 1;
    this.updateLeavesView();
  }

  onMonthChange(): void {
    this.updateStatsForMonth();
    this.clearFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateLeavesView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateLeavesView();
  }

  updateStatsForMonth(): void {
    const monthRecs = this.leaveRecords.filter(
      (r) => !this.currentMonth || !r.month || r.month === this.currentMonth
    );
    if (monthRecs.length > 0) {
      this.appliedLeaves = monthRecs.reduce((acc, r) => acc + r.days, 0);
      this.pendingLeaves = monthRecs
        .filter((r) => r.status === 'Pending')
        .reduce((acc, r) => acc + r.days, 0);
      this.approvedLeaves = monthRecs
        .filter((r) => r.status === 'Approved')
        .reduce((acc, r) => acc + r.days, 0);
      this.rejectedLeaves = monthRecs
        .filter((r) => r.status === 'Rejected')
        .reduce((acc, r) => acc + r.days, 0);
    } else {
      this.appliedLeaves = 0;
      this.pendingLeaves = 0;
      this.approvedLeaves = 0;
      this.rejectedLeaves = 0;
    }
    this.rebuildStatCards();
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Approved':
        return 'soft-success';
      case 'Pending':
        return 'soft-warning';
      case 'Rejected':
        return 'soft-danger';
      default:
        return 'light';
    }
  }
}
