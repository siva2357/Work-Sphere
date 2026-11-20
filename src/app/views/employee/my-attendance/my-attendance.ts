import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceRecord, CalendarDay } from '../../../core/models/attendance.interface';
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

export type { AttendanceRecord, CalendarDay };

export interface AttendanceFilterChip {
  key: 'search' | 'status' | 'date';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-my-attendance',
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
  templateUrl: './my-attendance.html',
  styleUrl: './my-attendance.css',
})
export class MyAttendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  @ViewChild('dateTpl', { static: true }) dateTpl!: TemplateRef<any>;
  @ViewChild('loginTimeTpl', { static: true }) loginTimeTpl!: TemplateRef<any>;
  @ViewChild('loginLocTpl', { static: true }) loginLocTpl!: TemplateRef<any>;
  @ViewChild('logoutTimeTpl', { static: true }) logoutTimeTpl!: TemplateRef<any>;
  @ViewChild('logoutLocTpl', { static: true }) logoutLocTpl!: TemplateRef<any>;
  @ViewChild('hoursTpl', { static: true }) hoursTpl!: TemplateRef<any>;
  @ViewChild('remarksTpl', { static: true }) remarksTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];
  isLoadingAttendance = false;

  readonly availableMonths: string[] = [
    'October 2026',
    'September 2026',
    'August 2026',
    'July 2026',
  ];
  currentMonth = 'October 2026';

  // Draft Filter Inputs
  draftSearchTerm = '';
  draftStatusFilter = 'ALL';

  // Applied Filter State
  searchTerm = '';
  statusFilter = 'ALL';
  selectedDateFilter: number | null = null;

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Present', value: 'PRESENT' },
    { label: 'Absent', value: 'ABSENT' },
    { label: 'Leave', value: 'LEAVE' },
    { label: 'Weekend', value: 'WEEKEND' },
    { label: 'Holiday', value: 'HOLIDAY' },
  ];

  totalWorkingDays = 22;
  presentDays = 0;
  absentDays = 0;
  leaveDays = 0;
  overallHoursPresent = '0 hrs';

  statCards: StatMetric[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: (CalendarDay | null)[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  paginatedRecords: AttendanceRecord[] = [];
  activeFilterChips: AttendanceFilterChip[] = [];

  ngOnInit(): void {
    this.initTableColumns();
    this.rebuildStatCards();
    this.loadMyAttendance();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 70,
      },
      {
        field: 'date',
        headerName: 'Date & Day',
        cellTemplate: this.dateTpl,
        width: 170,
      },
      {
        field: 'loginTime',
        headerName: 'Login Time',
        cellTemplate: this.loginTimeTpl,
        width: 130,
      },
      {
        field: 'loginLocation',
        headerName: 'Login Loc (Lat, Long)',
        cellTemplate: this.loginLocTpl,
        width: 175,
      },
      {
        field: 'logoutTime',
        headerName: 'Logout Time',
        cellTemplate: this.logoutTimeTpl,
        width: 130,
      },
      {
        field: 'logoutLocation',
        headerName: 'Logout Loc (Lat, Long)',
        cellTemplate: this.logoutLocTpl,
        width: 175,
      },
      {
        field: 'hoursPresent',
        headerName: 'Hours Present',
        cellTemplate: this.hoursTpl,
        width: 130,
      },
      {
        field: 'remarks',
        headerName: 'Remarks',
        cellTemplate: this.remarksTpl,
        width: 130,
      },
    ];
  }

  private loadMyAttendance(): void {
    this.isLoadingAttendance = true;
    const empCode = this.authService.getCurrentEmployeeCode();

    this.attendanceService
      .fetchMyAttendance$(empCode)
      .pipe(finalize(() => (this.isLoadingAttendance = false)))
      .subscribe((res: any) => {
        if (res?.stats) {
          this.totalWorkingDays = res.stats.totalWorkingDays ?? 22;
          this.presentDays = res.stats.presentDays ?? 0;
          this.absentDays = res.stats.absentDays ?? 0;
          this.leaveDays = res.stats.leaveDays ?? 0;
          if (res.stats.totalHoursWorked !== undefined) {
            this.overallHoursPresent = `${res.stats.totalHoursWorked} hrs`;
          }
        }

        if (Array.isArray(res?.logs)) {
          this.attendanceRecords = res.logs.map((l: any, idx: number) => ({
            sNo: idx + 1,
            date: l.date || '',
            dayName: l.dayName || '',
            dayNumber: Number(l.dayNumber || idx + 1),
            loginTime: l.loginTime || '--:--',
            loginLocation: l.loginLocation || '--',
            logoutTime: l.logoutTime || '--:--',
            logoutLocation: l.logoutLocation || '--',
            hoursPresent: l.hoursPresent || '0h 00m',
            status: (l.status as AttendanceRecord['status']) || 'Present',
            remarks:
              (l.remarks as AttendanceRecord['remarks']) ||
              (l.status as AttendanceRecord['remarks']) ||
              'Present',
          }));
        }

        this.generateCalendar();
        this.rebuildStatCards();
        this.updateAttendanceView();
      });
  }

  private rebuildStatCards(): void {
    this.statCards = [
      {
        title: 'Present Days',
        value: `${this.presentDays} / ${this.totalWorkingDays}`,
        subtitle: 'Logged this month',
        badgeText: 'Present',
        badgeType: 'emerald',
        icon: 'bi-calendar2-check',
      },
      {
        title: 'Absent Days',
        value: `${this.absentDays} / ${this.totalWorkingDays}`,
        subtitle: 'Unscheduled absences',
        badgeText: this.absentDays === 0 ? 'Optimal' : 'Recorded',
        badgeType: this.absentDays === 0 ? 'success' : 'danger',
        icon: 'bi-calendar2-x',
      },
      {
        title: 'Leave Days',
        value: `${this.leaveDays} / ${this.totalWorkingDays}`,
        subtitle: 'Approved time-off',
        badgeText: 'Leave',
        badgeType: 'warning',
        icon: 'bi-calendar2-minus',
      },
      {
        title: 'Overall Hours Present',
        value: this.overallHoursPresent,
        subtitle: 'Cumulative shift hours',
        badgeText: 'Tracked',
        badgeType: 'info',
        icon: 'bi-clock-history',
      },
    ];
  }

  generateCalendar(): void {
    const firstDayIndex = 4;
    const totalDays = 31;
    this.calendarDays = [];

    for (let i = 0; i < firstDayIndex; i++) {
      this.calendarDays.push(null);
    }

    for (let d = 1; d <= totalDays; d++) {
      const rec = this.attendanceRecords.find((r) => r.dayNumber === d);
      const dayOfWeek = (firstDayIndex + d - 1) % 7;
      let status: CalendarDay['status'] = 'present';

      if (rec) {
        status = (rec.status.toLowerCase() as CalendarDay['status']) || 'present';
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'weekend';
      }

      this.calendarDays.push({
        day: d,
        dateStr: `${d} Oct 2026`,
        status,
        isToday: d === 24,
        isSelected: this.selectedDateFilter === d,
      });
    }
  }

  private updateAttendanceView(): void {
    const q = this.searchTerm.toLowerCase();
    this.filteredRecords = this.attendanceRecords.filter((rec) => {
      if (this.selectedDateFilter && rec.dayNumber !== this.selectedDateFilter) {
        return false;
      }
      if (this.statusFilter !== 'ALL' && rec.remarks.toUpperCase() !== this.statusFilter) {
        return false;
      }
      if (q) {
        const matchesQuery =
          rec.date.toLowerCase().includes(q) ||
          rec.dayName.toLowerCase().includes(q) ||
          rec.remarks.toLowerCase().includes(q) ||
          rec.loginTime.toLowerCase().includes(q) ||
          rec.logoutTime.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      return true;
    });

    const totalPages = Math.max(1, Math.ceil(this.filteredRecords.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedRecords = this.filteredRecords.slice(start, start + this.pageSize);

    const chips: AttendanceFilterChip[] = [];
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
    if (this.selectedDateFilter) {
      chips.push({
        key: 'date',
        label: `Date: ${this.selectedDateFilter} Oct`,
        icon: 'bi-calendar-event',
      });
    }
    this.activeFilterChips = chips;
  }

  selectDay(calDay: CalendarDay | null): void {
    if (!calDay || calDay.status === 'future') return;

    if (this.selectedDateFilter === calDay.day) {
      this.selectedDateFilter = null;
      this.calendarDays.forEach((d) => {
        if (d) d.isSelected = false;
      });
    } else {
      this.selectedDateFilter = calDay.day;
      this.calendarDays.forEach((d) => {
        if (d) d.isSelected = d.day === calDay.day;
      });
    }
    this.currentPage = 1;
    this.updateAttendanceView();
  }

  applyFilters(): void {
    this.searchTerm = this.draftSearchTerm.trim();
    this.statusFilter = this.draftStatusFilter || 'ALL';
    this.currentPage = 1;
    this.updateAttendanceView();
  }

  clearFilters(): void {
    this.draftSearchTerm = '';
    this.draftStatusFilter = 'ALL';
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.selectedDateFilter = null;
    this.calendarDays.forEach((d) => {
      if (d) d.isSelected = false;
    });
    this.currentPage = 1;
    this.updateAttendanceView();
  }

  removeFilterChip(key: 'search' | 'status' | 'date'): void {
    if (key === 'search') {
      this.draftSearchTerm = '';
      this.searchTerm = '';
    } else if (key === 'status') {
      this.draftStatusFilter = 'ALL';
      this.statusFilter = 'ALL';
    } else if (key === 'date') {
      this.selectedDateFilter = null;
      this.calendarDays.forEach((d) => {
        if (d) d.isSelected = false;
      });
    }
    this.currentPage = 1;
    this.updateAttendanceView();
  }

  onMonthChange(): void {
    this.clearFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateAttendanceView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateAttendanceView();
  }

  getRemarksBadgeVariant(remarks?: string): BadgeVariant {
    switch ((remarks || '').toUpperCase()) {
      case 'PRESENT':
        return 'soft-success';
      case 'LEAVE':
        return 'soft-warning';
      case 'ABSENT':
        return 'soft-danger';
      case 'HOLIDAY':
        return 'soft-info';
      default:
        return 'light';
    }
  }
}
