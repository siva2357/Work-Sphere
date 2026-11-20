import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AttendanceService,
  ManagedEmployeeAttendance,
  DailyAttendanceRecord,
} from '../../../../core/services/attendance.service';
import {
  StatCards,
  StatMetric,
} from '../../../../library/shared/components/stat-cards/stat-cards';
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
} from '../../../../library/UI/components';

export interface SheetFilterChip {
  key: 'search' | 'status';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-attendance-sheet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    StatCards,
    Button,
    InputField,
    Badge,
    Chip,
    Table,
    Pagination,
    Toaster,
  ],
  templateUrl: './attendance-sheet.html',
  styleUrl: './attendance-sheet.css',
})
export class AttendanceSheet implements OnInit {
  private route = inject(ActivatedRoute);
  private attendanceService = inject(AttendanceService);
  private toaster = inject(ToasterService);

  @ViewChild('dateTpl', { static: true }) dateTpl!: TemplateRef<any>;
  @ViewChild('clockInTpl', { static: true }) clockInTpl!: TemplateRef<any>;
  @ViewChild('clockOutTpl', { static: true }) clockOutTpl!: TemplateRef<any>;
  @ViewChild('workHoursTpl', { static: true }) workHoursTpl!: TemplateRef<any>;
  @ViewChild('overtimeTpl', { static: true }) overtimeTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('modeTpl', { static: true }) modeTpl!: TemplateRef<any>;
  @ViewChild('approvalTpl', { static: true }) approvalTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];

  employee?: ManagedEmployeeAttendance;
  attendanceLogs: (DailyAttendanceRecord & { sNo?: number })[] = [];
  filteredLogs: (DailyAttendanceRecord & { sNo?: number })[] = [];
  paginatedLogs: (DailyAttendanceRecord & { sNo?: number })[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: SheetFilterChip[] = [];

  // Month & Filters
  selectedMonth = 'October 2026';
  readonly availableMonths: string[] = ['October 2026', 'September 2026', 'August 2026'];

  draftSearchQuery = '';
  draftStatusFilter = 'ALL';

  searchQuery = '';
  statusFilter = 'ALL';

  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Days', value: 'ALL' },
    { label: 'Present Only', value: 'Present' },
    { label: 'Late Only', value: 'Late' },
    { label: 'Absent', value: 'Absent' },
    { label: 'On Leave', value: 'On Leave' },
  ];

  presentDaysCount = 0;
  absentDaysCount = 0;
  leaveDaysCount = 0;
  lateDaysCount = 0;

  ngOnInit(): void {
    this.initTableColumns();

    this.attendanceService.employees$.subscribe(() => {
      const empId =
        this.route.snapshot.queryParams['id'] || this.attendanceService.getSelectedEmployeeId();
      if (empId) {
        this.loadEmployeeSheet(empId);
      }
    });
    this.route.queryParams.subscribe((params) => {
      const empId = params['id'] || this.attendanceService.getSelectedEmployeeId() || 'EMP-0135';
      this.loadEmployeeSheet(empId);
    });
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 75,
      },
      {
        field: 'date',
        headerName: 'Date & Day',
        cellTemplate: this.dateTpl,
        width: 170,
      },
      {
        field: 'punchIn',
        headerName: 'Clock In',
        cellTemplate: this.clockInTpl,
        width: 130,
      },
      {
        field: 'punchOut',
        headerName: 'Clock Out',
        cellTemplate: this.clockOutTpl,
        width: 130,
      },
      {
        field: 'workHours',
        headerName: 'Work Hours',
        cellTemplate: this.workHoursTpl,
        width: 130,
      },
      {
        field: 'overtime',
        headerName: 'Overtime',
        cellTemplate: this.overtimeTpl,
        width: 120,
      },
      {
        field: 'workMode',
        headerName: 'Work Mode',
        cellTemplate: this.modeTpl,
        width: 145,
      },
      {
        field: 'approvalStatus',
        headerName: 'Approval',
        cellTemplate: this.approvalTpl,
        width: 170,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.statusTpl,
        width: 130,
      },
      {
        field: 'remarks',
        headerName: 'Remarks',
        width: 190,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.actionsTpl,
        width: 90,
      },
    ];
  }

  loadEmployeeSheet(empId: string): void {
    this.employee = this.attendanceService.getEmployeeById(empId);
    if (this.employee) {
      this.attendanceLogs = this.attendanceService.generateMonthlyAttendanceLogs(
        this.employee.id,
        this.selectedMonth
      );
      this.updateSheetView();
    }
  }

  onMonthChange(): void {
    if (this.employee) {
      this.attendanceLogs = this.attendanceService.generateMonthlyAttendanceLogs(
        this.employee.id,
        this.selectedMonth
      );
      this.resetFilters();
    }
  }

  private updateSheetView(): void {
    this.presentDaysCount = this.attendanceLogs.filter(
      (l) => l.status === 'Present' || l.status === 'Late'
    ).length;
    this.absentDaysCount = this.attendanceLogs.filter((l) => l.status === 'Absent').length;
    this.leaveDaysCount = this.attendanceLogs.filter((l) => l.status === 'On Leave').length;
    this.lateDaysCount = this.attendanceLogs.filter((l) => l.status === 'Late').length;

    this.statCards = [
      {
        title: 'Present Days',
        value: `${this.presentDaysCount} Days`,
        subtitle: `${this.lateDaysCount} check-ins with grace period`,
        badgeText: 'Present',
        badgeType: 'emerald',
        icon: 'bi-calendar-check-fill',
      },
      {
        title: 'Unscheduled Absent',
        value: `${this.absentDaysCount} Days`,
        subtitle: 'Requires regularization',
        badgeText: 'Absent',
        badgeType: 'danger',
        icon: 'bi-calendar-x-fill',
      },
      {
        title: 'Approved Leaves',
        value: `${this.leaveDaysCount} Days`,
        subtitle: 'Casual & Sick Leaves',
        badgeText: 'Leave',
        badgeType: 'warning',
        icon: 'bi-calendar-minus-fill',
      },
      {
        title: 'Total Overtime',
        value: `+${this.employee?.overtimeHours || 0} Hrs`,
        subtitle: 'Verified sprint hours',
        badgeText: 'Overtime',
        badgeType: 'info',
        icon: 'bi-clock-history',
      },
    ];

    const q = this.searchQuery.toLowerCase().trim();
    this.filteredLogs = this.attendanceLogs.filter((log) => {
      if (this.statusFilter !== 'ALL' && log.status !== this.statusFilter) {
        return false;
      }
      if (q) {
        const matches =
          log.date.toLowerCase().includes(q) ||
          log.dayOfWeek.toLowerCase().includes(q) ||
          log.status.toLowerCase().includes(q) ||
          log.workMode.toLowerCase().includes(q) ||
          (log.remarks || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    const totalPages = Math.max(1, Math.ceil(this.filteredLogs.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedLogs = this.filteredLogs
      .slice(start, start + this.pageSize)
      .map((log, idx) => ({
        ...log,
        sNo: start + idx + 1,
      }));

    const chips: SheetFilterChip[] = [];
    if (this.searchQuery.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.searchQuery.trim()}"`,
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
    this.activeFilterChips = chips;
  }

  applyFilters(): void {
    this.searchQuery = this.draftSearchQuery.trim();
    this.statusFilter = this.draftStatusFilter || 'ALL';
    this.currentPage = 1;
    this.updateSheetView();
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftStatusFilter = 'ALL';
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.currentPage = 1;
    this.updateSheetView();
  }

  removeFilterChip(key: SheetFilterChip['key']): void {
    if (key === 'search') {
      this.draftSearchQuery = '';
      this.searchQuery = '';
    } else if (key === 'status') {
      this.draftStatusFilter = 'ALL';
      this.statusFilter = 'ALL';
    }
    this.currentPage = 1;
    this.updateSheetView();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateSheetView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateSheetView();
  }

  updateDailyLogStatus(
    log: DailyAttendanceRecord,
    newStatus: DailyAttendanceRecord['status'],
    event?: Event
  ): void {
    if (event) event.stopPropagation();
    const target = this.attendanceLogs.find((l) => l.date === log.date) || log;
    target.status = newStatus;
    target.remarks = newStatus;
    target.approvalStatus = newStatus === 'Absent' ? 'Pending Regularization' : 'Approved';
    this.updateSheetView();
    this.toaster.success(
      `Attendance log for ${target.date} updated to "${newStatus}".`,
      'Log Updated'
    );
  }

  sendReminder(): void {
    if (this.employee) {
      this.attendanceService.sendReminder(this.employee.id);
      this.employee = this.attendanceService.getEmployeeById(this.employee.id);
      this.toaster.success(
        `Attendance reminder email dispatched to ${this.employee?.name} (${this.employee?.email}).`,
        'Reminder Sent'
      );
    }
  }

  exportSheet(): void {
    this.toaster.success(
      `Attendance sheet exported for ${this.employee?.name} (${this.selectedMonth}).`,
      'Exported'
    );
  }

  printSheet(): void {
    window.print();
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Present':
        return 'soft-emerald';
      case 'Late':
        return 'soft-warning';
      case 'Half Day':
      case 'Pending':
        return 'soft-info';
      case 'Absent':
        return 'soft-danger';
      case 'On Leave':
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
