import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttendanceService, ManagedEmployeeAttendance, DailyAttendanceRecord } from '../../../../core/services/attendance.service';

@Component({
  selector: 'app-attendance-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './attendance-sheet.html',
  styleUrl: './attendance-sheet.css',
})
export class AttendanceSheet implements OnInit {
  employee?: ManagedEmployeeAttendance;
  attendanceLogs: DailyAttendanceRecord[] = [];

  // Month & Filters
  selectedMonth: string = 'October 2026';
  readonly availableMonths: string[] = ['October 2026', 'September 2026', 'August 2026'];
  statusFilter: string = 'ALL';

  // Toast Feedback
  actionToastMessage: string = '';
  private toastTimer: any;

  constructor(
    private route: ActivatedRoute,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const empId = params['id'] || this.attendanceService.getSelectedEmployeeId() || 'EMP-0135';
      this.loadEmployeeSheet(empId);
    });
  }

  loadEmployeeSheet(empId: string): void {
    this.employee = this.attendanceService.getEmployeeById(empId);
    if (this.employee) {
      this.attendanceLogs = this.attendanceService.generateMonthlyAttendanceLogs(this.employee.id, this.selectedMonth);
    }
  }

  onMonthChange(): void {
    if (this.employee) {
      this.attendanceLogs = this.attendanceService.generateMonthlyAttendanceLogs(this.employee.id, this.selectedMonth);
    }
  }

  get filteredLogs(): DailyAttendanceRecord[] {
    if (this.statusFilter === 'ALL') {
      return this.attendanceLogs;
    }
    return this.attendanceLogs.filter((log) => log.status === this.statusFilter);
  }

  // Summary Metrics
  get presentDaysCount(): number {
    return this.attendanceLogs.filter((l) => l.status === 'Present' || l.status === 'Late').length;
  }

  get absentDaysCount(): number {
    return this.attendanceLogs.filter((l) => l.status === 'Absent').length;
  }

  get leaveDaysCount(): number {
    return this.attendanceLogs.filter((l) => l.status === 'On Leave').length;
  }

  get lateDaysCount(): number {
    return this.attendanceLogs.filter((l) => l.status === 'Late').length;
  }

  get weekendDaysCount(): number {
    return this.attendanceLogs.filter((l) => l.status === 'Weekend').length;
  }

  // Trigger Reminder
  sendReminder(): void {
    if (this.employee) {
      this.attendanceService.sendReminder(this.employee.id);
      this.employee = this.attendanceService.getEmployeeById(this.employee.id);
      this.showToast(`Attendance reminder email dispatched to ${this.employee?.name} (${this.employee?.email})!`);
    }
  }

  exportSheet(): void {
    this.showToast(`Attendance sheet exported for ${this.employee?.name} (${this.selectedMonth}).`);
  }

  printSheet(): void {
    window.print();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Present':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'Late':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Half Day':
        return 'bg-info-subtle text-info border border-info-subtle';
      case 'Absent':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'On Leave':
        return 'bg-secondary-subtle text-dark border';
      case 'Weekend':
        return 'bg-light text-muted border';
      case 'Pending':
        return 'bg-info-subtle text-info border border-info-subtle';
      default:
        return 'bg-light text-dark';
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'EMP';
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
