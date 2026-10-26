import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AttendanceService, ManagedEmployeeAttendance } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-management.html',
  styleUrl: './attendance-management.css',
})
export class AttendanceManagement implements OnInit {
  employees: ManagedEmployeeAttendance[] = [];

  // Filters & Search
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedManager: string = 'ALL';
  selectedDepartment: string = 'ALL';
  selectedSort: string = 'attendanceDesc';

  // Available Filter Options
  managers: string[] = [];
  departments: string[] = [];

  // Feedback Notifications
  actionToastMessage: string = '';
  private toastTimer: any;

  constructor(
    private attendanceService: AttendanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.extractFilterOptions();
  }

  loadEmployees(): void {
    this.employees = this.attendanceService.getManagedEmployees();
  }

  extractFilterOptions(): void {
    const mgrSet = new Set<string>();
    const deptSet = new Set<string>();
    this.employees.forEach((e) => {
      if (e.managerName) mgrSet.add(e.managerName);
      if (e.department) deptSet.add(e.department);
    });
    this.managers = Array.from(mgrSet);
    this.departments = Array.from(deptSet);
  }

  // Filtered List Getter
  get filteredEmployees(): ManagedEmployeeAttendance[] {
    let result = [...this.employees];

    // 1. Status Filter
    if (this.selectedStatus !== 'ALL') {
      if (this.selectedStatus === 'Overtime') {
        result = result.filter((e) => e.overtimeHours > 0);
      } else {
        result = result.filter((e) => e.todayStatus === this.selectedStatus);
      }
    }

    // 2. Manager Filter
    if (this.selectedManager !== 'ALL') {
      result = result.filter((e) => e.managerName === this.selectedManager);
    }

    // 3. Department Filter
    if (this.selectedDepartment !== 'ALL') {
      result = result.filter((e) => e.department === this.selectedDepartment);
    }

    // 4. Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (this.selectedSort === 'attendanceDesc') return b.attendanceRate - a.attendanceRate;
      if (this.selectedSort === 'attendanceAsc') return a.attendanceRate - b.attendanceRate;
      if (this.selectedSort === 'overtimeDesc') return b.overtimeHours - a.overtimeHours;
      if (this.selectedSort === 'presentDesc') return b.presentDays - a.presentDays;
      if (this.selectedSort === 'nameAsc') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }

  // Top Metrics
  get totalEmployeesCount(): number {
    return this.employees.length;
  }

  get presentTodayCount(): number {
    return this.employees.filter((e) => e.todayStatus === 'Present').length;
  }

  get absentTodayCount(): number {
    return this.employees.filter((e) => e.todayStatus === 'Absent').length;
  }

  get onLeaveTodayCount(): number {
    return this.employees.filter((e) => e.todayStatus === 'On Leave').length;
  }

  get pendingTodayCount(): number {
    return this.employees.filter((e) => e.todayStatus === 'Pending').length;
  }

  get totalOvertimeHours(): number {
    const sum = this.employees.reduce((acc, e) => acc + e.overtimeHours, 0);
    return Math.round(sum * 10) / 10;
  }

  get avgAttendanceRate(): number {
    if (this.employees.length === 0) return 0;
    const sum = this.employees.reduce((acc, e) => acc + e.attendanceRate, 0);
    return Math.round((sum / this.employees.length) * 10) / 10;
  }

  // Filter actions
  setStatusFilter(status: string): void {
    this.selectedStatus = status;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedManager = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedSort = 'attendanceDesc';
    this.loadEmployees();
    this.showToast('Attendance management filters reset.');
  }

  // Navigate to individual employee attendance sheet
  viewAttendanceSheet(emp: ManagedEmployeeAttendance): void {
    this.attendanceService.setSelectedEmployeeId(emp.id);
    this.router.navigate(['/employee/attendance-sheet'], {
      queryParams: { id: emp.id },
    });
  }

  // Send Email Reminder to mark attendance
  sendAttendanceReminder(emp: ManagedEmployeeAttendance, event?: Event): void {
    if (event) event.stopPropagation();

    const success = this.attendanceService.sendReminder(emp.id);
    if (success) {
      this.loadEmployees();
      this.showToast(`Attendance reminder email dispatched to ${emp.name} (${emp.email})!`);
    }
  }

  // Batch send reminders to all pending employees
  sendBatchPendingReminders(): void {
    const count = this.attendanceService.sendBatchReminders();
    this.loadEmployees();
    if (count > 0) {
      this.showToast(`Batch attendance reminder emails sent to ${count} pending employees!`);
    } else {
      this.showToast('All employees have already marked attendance today.');
    }
  }

  // Status Styling Helpers
  getTodayStatusClass(status: string): string {
    switch (status) {
      case 'Present':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'Absent':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'On Leave':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Pending':
        return 'bg-info-subtle text-info border border-info-subtle';
      default:
        return 'bg-light text-secondary border';
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }

  private showToast(msg: string): void {
    this.actionToastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.actionToastMessage = '';
    }, 4000);
  }
}
