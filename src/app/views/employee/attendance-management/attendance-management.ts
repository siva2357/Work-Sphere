import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AttendanceService,
  ManagedEmployeeAttendance,
} from '../../../core/services/attendance.service';
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

export interface AttendanceMgmtFilterChip {
  key: 'search' | 'status' | 'manager' | 'department' | 'sort';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-attendance-management',
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
  templateUrl: './attendance-management.html',
  styleUrl: './attendance-management.css',
})
export class AttendanceManagement implements OnInit {
  private attendanceService = inject(AttendanceService);
  private router = inject(Router);
  private toaster = inject(ToasterService);

  @ViewChild('empIdTpl', { static: true }) empIdTpl!: TemplateRef<any>;
  @ViewChild('profileImgTpl', { static: true }) profileImgTpl!: TemplateRef<any>;
  @ViewChild('empNameTpl', { static: true }) empNameTpl!: TemplateRef<any>;
  @ViewChild('emailTpl', { static: true }) emailTpl!: TemplateRef<any>;
  @ViewChild('departmentTpl', { static: true }) departmentTpl!: TemplateRef<any>;
  @ViewChild('designationTpl', { static: true }) designationTpl!: TemplateRef<any>;
  @ViewChild('managerTpl', { static: true }) managerTpl!: TemplateRef<any>;
  @ViewChild('presentTpl', { static: true }) presentTpl!: TemplateRef<any>;
  @ViewChild('absentTpl', { static: true }) absentTpl!: TemplateRef<any>;
  @ViewChild('onLeaveTpl', { static: true }) onLeaveTpl!: TemplateRef<any>;
  @ViewChild('overtimeTpl', { static: true }) overtimeTpl!: TemplateRef<any>;
  @ViewChild('todayStatusTpl', { static: true }) todayStatusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];

  // Draft Filter Inputs (bound to <app-input-field>)
  draftSearchQuery = '';
  draftStatus = 'ALL';
  draftManager = 'ALL';
  draftDepartment = 'ALL';
  draftSort = 'attendanceDesc';

  // Applied Filter State
  searchQuery = '';
  selectedStatus = 'ALL';
  selectedManager = 'ALL';
  selectedDepartment = 'ALL';
  selectedSort = 'attendanceDesc';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  managers: string[] = [];
  departments: string[] = [];

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Present', value: 'Present' },
    { label: 'Absent', value: 'Absent' },
    { label: 'On Leave', value: 'On Leave' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Overtime', value: 'Overtime' },
  ];

  managerFilterOptions: InputDropdownOption[] = [
    { label: 'All Reporting Managers', value: 'ALL' },
  ];

  departmentFilterOptions: InputDropdownOption[] = [
    { label: 'All Departments', value: 'ALL' },
  ];

  readonly sortFilterOptions: InputDropdownOption[] = [
    { label: 'Attendance %: Highest First', value: 'attendanceDesc' },
    { label: 'Attendance %: Lowest First', value: 'attendanceAsc' },
    { label: 'Overtime: Most Hours', value: 'overtimeDesc' },
    { label: 'Present Days: Highest First', value: 'presentDesc' },
    { label: 'Name: Alphabetical', value: 'nameAsc' },
  ];

  // Cached Data & View State
  employees: (ManagedEmployeeAttendance & { sNo?: number })[] = [];
  filteredEmployees: (ManagedEmployeeAttendance & { sNo?: number })[] = [];
  paginatedEmployees: (ManagedEmployeeAttendance & { sNo?: number })[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: AttendanceMgmtFilterChip[] = [];

  totalEmployeesCount = 0;
  presentTodayCount = 0;
  absentTodayCount = 0;
  onLeaveTodayCount = 0;
  pendingTodayCount = 0;
  totalOvertimeHours = 0;
  avgAttendanceRate = 0;

  ngOnInit(): void {
    this.initTableColumns();
    this.updateAttendanceMgmtView();

    this.attendanceService.employees$.subscribe((list) => {
      this.employees = list || [];
      this.extractFilterOptions();
      this.updateAttendanceMgmtView();
    });
    this.attendanceService.refreshManagedEmployees();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 75,
      },
      {
        field: 'id',
        headerName: 'Emp ID',
        cellTemplate: this.empIdTpl,
        width: 120,
      },
      {
        field: 'avatarColor',
        headerName: 'Profile Image',
        cellTemplate: this.profileImgTpl,
        width: 125,
      },
      {
        field: 'name',
        headerName: 'Full Name',
        cellTemplate: this.empNameTpl,
        width: 210,
      },
      {
        field: 'email',
        headerName: 'Email',
        cellTemplate: this.emailTpl,
        width: 260,
      },
      {
        field: 'department',
        headerName: 'Department',
        cellTemplate: this.departmentTpl,
        width: 280,
      },
      {
        field: 'designation',
        headerName: 'Designation',
        cellTemplate: this.designationTpl,
        width: 235,
      },
      {
        field: 'managerName',
        headerName: 'Reporting Manager',
        cellTemplate: this.managerTpl,
        width: 195,
      },
      {
        field: 'presentDays',
        headerName: 'Present',
        cellTemplate: this.presentTpl,
        width: 140,
      },
      {
        field: 'absentDays',
        headerName: 'Absent',
        cellTemplate: this.absentTpl,
        width: 115,
      },
      {
        field: 'onLeaveDays',
        headerName: 'On Leave',
        cellTemplate: this.onLeaveTpl,
        width: 120,
      },
      {
        field: 'overtimeHours',
        headerName: 'Overtime',
        cellTemplate: this.overtimeTpl,
        width: 115,
      },
      {
        field: 'todayStatus',
        headerName: 'Status',
        cellTemplate: this.todayStatusTpl,
        width: 130,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.actionsTpl,
        width: 90,
      },
    ];
  }

  private extractFilterOptions(): void {
    const mgrSet = new Set<string>();
    const deptSet = new Set<string>();
    this.employees.forEach((e) => {
      if (e.managerName) mgrSet.add(e.managerName);
      if (e.department) deptSet.add(e.department);
    });
    this.managers = Array.from(mgrSet);
    this.departments = Array.from(deptSet);

    this.managerFilterOptions = [
      { label: 'All Reporting Managers', value: 'ALL' },
      ...this.managers.map((m) => ({ label: m, value: m })),
    ];

    this.departmentFilterOptions = [
      { label: 'All Departments', value: 'ALL' },
      ...this.departments.map((d) => ({ label: d, value: d })),
    ];
  }

  private updateAttendanceMgmtView(): void {
    this.totalEmployeesCount = this.employees.length;
    this.presentTodayCount = this.employees.filter((e) => e.todayStatus === 'Present').length;
    this.absentTodayCount = this.employees.filter((e) => e.todayStatus === 'Absent').length;
    this.onLeaveTodayCount = this.employees.filter((e) => e.todayStatus === 'On Leave').length;
    this.pendingTodayCount = this.employees.filter((e) => e.todayStatus === 'Pending').length;

    const overtimeSum = this.employees.reduce((acc, e) => acc + e.overtimeHours, 0);
    this.totalOvertimeHours = Math.round(overtimeSum * 10) / 10;

    if (this.employees.length > 0) {
      const rateSum = this.employees.reduce((acc, e) => acc + e.attendanceRate, 0);
      this.avgAttendanceRate = Math.round((rateSum / this.employees.length) * 10) / 10;
    } else {
      this.avgAttendanceRate = 0;
    }

    this.statCards = [
      {
        title: 'Total Workforce',
        value: `${this.totalEmployeesCount} Staff`,
        subtitle: 'Under managers',
        badgeText: 'Roster',
        badgeType: 'emerald',
        icon: 'bi-people-fill',
      },
      {
        title: 'Present Today',
        value: `${this.presentTodayCount} Staff`,
        subtitle: `${this.avgAttendanceRate}% Avg rate`,
        badgeText: 'Present',
        badgeType: 'success',
        icon: 'bi-person-check-fill',
      },
      {
        title: 'Absent Today',
        value: `${this.absentTodayCount} Staff`,
        subtitle: 'Unscheduled',
        badgeText: 'Absent',
        badgeType: 'danger',
        icon: 'bi-person-x-fill',
      },
      {
        title: 'On Leave',
        value: `${this.onLeaveTodayCount} Staff`,
        subtitle: 'Approved leaves',
        badgeText: 'Leave',
        badgeType: 'warning',
        icon: 'bi-calendar2-minus-fill',
      },
      {
        title: 'Pending Check-In',
        value: `${this.pendingTodayCount} Staff`,
        subtitle: 'Punch missing',
        badgeText: 'Pending',
        badgeType: 'info',
        icon: 'bi-hourglass-split',
      },
      {
        title: 'Overtime Logged',
        value: `+${this.totalOvertimeHours} Hrs`,
        subtitle: 'Extra sprint hours',
        badgeText: 'Overtime',
        badgeType: 'emerald',
        icon: 'bi-clock-history',
      },
    ];

    let result = [...this.employees];

    if (this.selectedStatus !== 'ALL') {
      if (this.selectedStatus === 'Overtime') {
        result = result.filter((e) => e.overtimeHours > 0);
      } else {
        result = result.filter((e) => e.todayStatus === this.selectedStatus);
      }
    }

    if (this.selectedManager !== 'ALL') {
      result = result.filter((e) => e.managerName === this.selectedManager);
    }

    if (this.selectedDepartment !== 'ALL') {
      result = result.filter((e) => e.department === this.selectedDepartment);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.managerName.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (this.selectedSort === 'attendanceDesc') return b.attendanceRate - a.attendanceRate;
      if (this.selectedSort === 'attendanceAsc') return a.attendanceRate - b.attendanceRate;
      if (this.selectedSort === 'overtimeDesc') return b.overtimeHours - a.overtimeHours;
      if (this.selectedSort === 'presentDesc') return b.presentDays - a.presentDays;
      if (this.selectedSort === 'nameAsc') return a.name.localeCompare(b.name);
      return 0;
    });

    this.filteredEmployees = result;

    const totalPages = Math.max(1, Math.ceil(this.filteredEmployees.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedEmployees = this.filteredEmployees
      .slice(start, start + this.pageSize)
      .map((emp, idx) => ({
        ...emp,
        sNo: start + idx + 1,
      }));

    const chips: AttendanceMgmtFilterChip[] = [];
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
    if (this.selectedManager !== 'ALL') {
      chips.push({
        key: 'manager',
        label: `Manager: ${this.selectedManager}`,
        icon: 'bi-person-workspace',
      });
    }
    if (this.selectedDepartment !== 'ALL') {
      chips.push({
        key: 'department',
        label: `Dept: ${this.selectedDepartment}`,
        icon: 'bi-building',
      });
    }
    if (this.selectedSort !== 'attendanceDesc') {
      const sortOpt = this.sortFilterOptions.find((o) => o.value === this.selectedSort);
      chips.push({
        key: 'sort',
        label: `Sort: ${sortOpt?.label || this.selectedSort}`,
        icon: 'bi-sort-down',
      });
    }
    this.activeFilterChips = chips;
  }

  applyFilters(): void {
    this.searchQuery = this.draftSearchQuery.trim();
    this.selectedStatus = this.draftStatus || 'ALL';
    this.selectedManager = this.draftManager || 'ALL';
    this.selectedDepartment = this.draftDepartment || 'ALL';
    this.selectedSort = this.draftSort || 'attendanceDesc';
    this.currentPage = 1;
    this.updateAttendanceMgmtView();
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftStatus = 'ALL';
    this.draftManager = 'ALL';
    this.draftDepartment = 'ALL';
    this.draftSort = 'attendanceDesc';
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedManager = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedSort = 'attendanceDesc';
    this.currentPage = 1;
    this.updateAttendanceMgmtView();
  }

  refreshAttendance(): void {
    this.attendanceService.refreshManagedEmployees();
    this.toaster.info('Attendance roster refreshed.', 'Refreshed');
  }

  removeFilterChip(key: AttendanceMgmtFilterChip['key']): void {
    if (key === 'search') {
      this.draftSearchQuery = '';
      this.searchQuery = '';
    } else if (key === 'status') {
      this.draftStatus = 'ALL';
      this.selectedStatus = 'ALL';
    } else if (key === 'manager') {
      this.draftManager = 'ALL';
      this.selectedManager = 'ALL';
    } else if (key === 'department') {
      this.draftDepartment = 'ALL';
      this.selectedDepartment = 'ALL';
    } else if (key === 'sort') {
      this.draftSort = 'attendanceDesc';
      this.selectedSort = 'attendanceDesc';
    }
    this.currentPage = 1;
    this.updateAttendanceMgmtView();
  }

  setStatusFilter(status: string): void {
    this.draftStatus = status;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.updateAttendanceMgmtView();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateAttendanceMgmtView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateAttendanceMgmtView();
  }

  viewAttendanceSheet(emp: ManagedEmployeeAttendance): void {
    this.attendanceService.setSelectedEmployeeId(emp.id);
    this.router.navigate(['/attendance-sheet'], {
      queryParams: { id: emp.id },
    });
  }

  changeTodayStatus(
    emp: ManagedEmployeeAttendance,
    newStatus: ManagedEmployeeAttendance['todayStatus'],
    event?: Event
  ): void {
    if (event) event.stopPropagation();
    const target = this.employees.find((e) => e.id === emp.id) || emp;
    target.todayStatus = newStatus;
    if (newStatus === 'Present') {
      target.pendingDays = 0;
    } else if (newStatus === 'Absent') {
      target.absentDays = Math.max(1, target.absentDays);
    } else if (newStatus === 'On Leave') {
      target.onLeaveDays = Math.max(1, target.onLeaveDays);
    }
    this.updateAttendanceMgmtView();
    this.toaster.success(
      `Updated ${target.name}'s attendance status to "${newStatus}".`,
      'Status Updated'
    );
  }

  sendAttendanceReminder(emp: ManagedEmployeeAttendance, event?: Event): void {
    if (event) event.stopPropagation();

    const success = this.attendanceService.sendReminder(emp.id);
    if (success) {
      this.employees = this.attendanceService.getManagedEmployees();
      this.updateAttendanceMgmtView();
      this.toaster.success(
        `Attendance reminder email dispatched to ${emp.name} (${emp.email}).`,
        'Reminder Sent'
      );
    }
  }

  sendBatchPendingReminders(): void {
    const count = this.attendanceService.sendBatchReminders();
    this.employees = this.attendanceService.getManagedEmployees();
    this.updateAttendanceMgmtView();
    if (count > 0) {
      this.toaster.success(
        `Batch attendance reminder emails sent to ${count} pending employees!`,
        'Batch Sent'
      );
    } else {
      this.toaster.info('All employees have already marked attendance today.', 'Up to Date');
    }
  }

  getTodayStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Present':
        return 'soft-emerald';
      case 'Absent':
        return 'soft-danger';
      case 'On Leave':
        return 'soft-warning';
      case 'Pending':
        return 'soft-info';
      default:
        return 'light';
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
}
