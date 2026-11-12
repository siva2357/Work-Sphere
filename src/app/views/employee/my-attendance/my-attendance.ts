import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceRecord, CalendarDay } from '../../../core/models/attendance.interface';

export type { AttendanceRecord, CalendarDay };

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-attendance.html',
  styleUrl: './my-attendance.css',
})
export class MyAttendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  availableMonths: string[] = [
    'October 2026',
    'September 2026',
    'August 2026',
    'July 2026',
  ];
  currentMonth = 'October 2026';
  selectedDateFilter: number | null = null;
  statusFilter: string = 'ALL';

  totalWorkingDays = 22;
  presentDays = 0;
  absentDays = 0;
  leaveDays = 0;
  overallHoursPresent = '0 hrs';

  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: (CalendarDay | null)[] = [];
  attendanceRecords: AttendanceRecord[] = [];

  ngOnInit(): void {
    const empCode = this.authService.getCurrentEmployeeCode();
    this.attendanceService.fetchMyAttendance$(empCode).subscribe((res: any) => {
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
          remarks: (l.remarks as AttendanceRecord['remarks']) || (l.status as AttendanceRecord['remarks']) || 'Present',
        }));
      }

      this.generateCalendar();
    });
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
        isSelected: false,
      });
    }
  }

  selectDay(calDay: CalendarDay | null): void {
    if (!calDay || calDay.status === 'future') return;

    this.calendarDays.forEach((d) => {
      if (d) d.isSelected = d.day === calDay.day;
    });

    if (this.selectedDateFilter === calDay.day) {
      this.selectedDateFilter = null;
      calDay.isSelected = false;
    } else {
      this.selectedDateFilter = calDay.day;
    }
  }

  onMonthChange(): void {
    this.clearFilters();
  }

  get filteredRecords(): AttendanceRecord[] {
    return this.attendanceRecords.filter((rec) => {
      if (this.selectedDateFilter && rec.dayNumber !== this.selectedDateFilter) {
        return false;
      }
      if (this.statusFilter !== 'ALL' && rec.remarks.toUpperCase() !== this.statusFilter) {
        return false;
      }
      return true;
    });
  }

  clearFilters(): void {
    this.selectedDateFilter = null;
    this.statusFilter = 'ALL';
    this.calendarDays.forEach((d) => {
      if (d) d.isSelected = false;
    });
  }
}
