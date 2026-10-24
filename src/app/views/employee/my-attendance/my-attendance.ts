import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface AttendanceRecord {
  sNo: number;
  date: string;
  dayName: string;
  dayNumber: number;
  loginTime: string;
  loginLocation: string;
  logoutTime: string;
  logoutLocation: string; // Lat, Long
  hoursPresent: string;
  status: 'Present' | 'Leave' | 'Weekend' | 'Holiday' | 'Absent';
  remarks: 'Present' | 'Absent' | 'Leave' | 'Weekend' | 'Holiday' | '--';
}

export interface CalendarDay {
  day: number;
  dateStr: string;
  status: 'present' | 'leave' | 'weekend' | 'holiday' | 'absent' | 'future';
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-attendance.html',
  styleUrl: './my-attendance.css',
})
export class MyAttendance {
  // Available months & current selection
  availableMonths: string[] = [
    'October 2026',
    'September 2026',
    'August 2026',
    'July 2026',
  ];
  currentMonth = 'October 2026';
  selectedDateFilter: number | null = null;
  statusFilter: string = 'ALL';

  // 4 Top Stat Cards (Out of 22 working days excluding Saturday & Sunday)
  totalWorkingDays = 22;
  presentDays = 15;
  absentDays = 5;
  leaveDays = 2;
  overallHoursPresent = '130.5 hrs';

  // Calendar setup (October 2026 starts on Thursday)
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: (CalendarDay | null)[] = [];

  // Full Month Attendance Records: Days 1 to 31 (Chronological order)
  attendanceRecords: AttendanceRecord[] = [
    {
      sNo: 1,
      date: '01 Oct 2026',
      dayName: 'Thursday',
      dayNumber: 1,
      loginTime: '09:08 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:08 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 00m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 2,
      date: '02 Oct 2026',
      dayName: 'Friday',
      dayNumber: 2,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Holiday',
      remarks: 'Holiday',
    },
    {
      sNo: 3,
      date: '03 Oct 2026',
      dayName: 'Saturday',
      dayNumber: 3,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Weekend',
      remarks: 'Weekend',
    },
    {
      sNo: 4,
      date: '04 Oct 2026',
      dayName: 'Sunday',
      dayNumber: 4,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Weekend',
      remarks: 'Weekend',
    },
    {
      sNo: 5,
      date: '05 Oct 2026',
      dayName: 'Monday',
      dayNumber: 5,
      loginTime: '09:00 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:00 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 00m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 6,
      date: '06 Oct 2026',
      dayName: 'Tuesday',
      dayNumber: 6,
      loginTime: '09:18 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:18 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 00m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 7,
      date: '07 Oct 2026',
      dayName: 'Wednesday',
      dayNumber: 7,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Absent',
      remarks: 'Absent',
    },
    {
      sNo: 8,
      date: '08 Oct 2026',
      dayName: 'Thursday',
      dayNumber: 8,
      loginTime: '09:05 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:05 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 00m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 9,
      date: '09 Oct 2026',
      dayName: 'Friday',
      dayNumber: 9,
      loginTime: '09:25 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:15 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '8h 50m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 10,
      date: '10 Oct 2026',
      dayName: 'Saturday',
      dayNumber: 10,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Weekend',
      remarks: 'Weekend',
    },
    {
      sNo: 11,
      date: '11 Oct 2026',
      dayName: 'Sunday',
      dayNumber: 11,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Weekend',
      remarks: 'Weekend',
    },
    {
      sNo: 12,
      date: '12 Oct 2026',
      dayName: 'Monday',
      dayNumber: 12,
      loginTime: '09:00 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:00 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 00m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 13,
      date: '13 Oct 2026',
      dayName: 'Tuesday',
      dayNumber: 13,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Absent',
      remarks: 'Absent',
    },
    {
      sNo: 14,
      date: '14 Oct 2026',
      dayName: 'Wednesday',
      dayNumber: 14,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Leave',
      remarks: 'Leave',
    },
    {
      sNo: 15,
      date: '15 Oct 2026',
      dayName: 'Thursday',
      dayNumber: 15,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Leave',
      remarks: 'Leave',
    },
    {
      sNo: 16,
      date: '16 Oct 2026',
      dayName: 'Friday',
      dayNumber: 16,
      loginTime: '09:02 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:10 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 08m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 17,
      date: '17 Oct 2026',
      dayName: 'Saturday',
      dayNumber: 17,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Weekend',
      remarks: 'Weekend',
    },
    {
      sNo: 18,
      date: '18 Oct 2026',
      dayName: 'Sunday',
      dayNumber: 18,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Weekend',
      remarks: 'Weekend',
    },
    {
      sNo: 19,
      date: '19 Oct 2026',
      dayName: 'Monday',
      dayNumber: 19,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Absent',
      remarks: 'Absent',
    },
    {
      sNo: 20,
      date: '20 Oct 2026',
      dayName: 'Tuesday',
      dayNumber: 20,
      loginTime: '09:12 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:15 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 03m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 21,
      date: '21 Oct 2026',
      dayName: 'Wednesday',
      dayNumber: 21,
      loginTime: '09:05 AM',
      loginLocation: '17.3850, 78.4867',
      logoutTime: '06:00 PM',
      logoutLocation: '17.3850, 78.4867',
      hoursPresent: '8h 55m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 22,
      date: '22 Oct 2026',
      dayName: 'Thursday',
      dayNumber: 22,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Absent',
      remarks: 'Absent',
    },
    {
      sNo: 23,
      date: '23 Oct 2026',
      dayName: 'Friday',
      dayNumber: 23,
      loginTime: '09:08 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:18 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 10m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 24,
      date: '24 Oct 2026',
      dayName: 'Saturday',
      dayNumber: 24,
      loginTime: '09:15 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '4h 38m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 25,
      date: '25 Oct 2026',
      dayName: 'Sunday',
      dayNumber: 25,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Weekend',
      remarks: 'Weekend',
    },
    {
      sNo: 26,
      date: '26 Oct 2026',
      dayName: 'Monday',
      dayNumber: 26,
      loginTime: '09:10 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:10 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 00m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 27,
      date: '27 Oct 2026',
      dayName: 'Tuesday',
      dayNumber: 27,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Absent',
      remarks: 'Absent',
    },
    {
      sNo: 28,
      date: '28 Oct 2026',
      dayName: 'Wednesday',
      dayNumber: 28,
      loginTime: '09:14 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:14 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 00m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 29,
      date: '29 Oct 2026',
      dayName: 'Thursday',
      dayNumber: 29,
      loginTime: '09:06 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:06 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 00m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 30,
      date: '30 Oct 2026',
      dayName: 'Friday',
      dayNumber: 30,
      loginTime: '09:00 AM',
      loginLocation: '17.4482, 78.3742',
      logoutTime: '06:00 PM',
      logoutLocation: '17.4482, 78.3742',
      hoursPresent: '9h 00m',
      status: 'Present',
      remarks: 'Present',
    },
    {
      sNo: 31,
      date: '31 Oct 2026',
      dayName: 'Saturday',
      dayNumber: 31,
      loginTime: '--:--',
      loginLocation: '--',
      logoutTime: '--:--',
      logoutLocation: '--',
      hoursPresent: '0h 00m',
      status: 'Weekend',
      remarks: 'Weekend',
    },
  ];

  constructor() {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const firstDayIndex = 4; // Oct 1, 2026 is Thursday
    const totalDays = 31;
    this.calendarDays = [];

    for (let i = 0; i < firstDayIndex; i++) {
      this.calendarDays.push(null);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dayOfWeek = (firstDayIndex + d - 1) % 7;
      let status: 'present' | 'leave' | 'weekend' | 'holiday' | 'absent' | 'future' = 'present';

      if (d === 2) {
        status = 'holiday';
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'weekend';
      } else if (d === 14 || d === 15) {
        status = 'leave';
      } else if ([7, 13, 19, 22, 27].includes(d)) {
        status = 'absent';
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
