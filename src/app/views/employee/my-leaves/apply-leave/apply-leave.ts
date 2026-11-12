import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../../core/services/leave.service';
import { CalendarDayView } from '../../../../core/models/leave.interface';

export type { CalendarDayView } from '../../../../core/models/leave.interface';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './apply-leave.html',
  styleUrl: './apply-leave.css',
})
export class ApplyLeave implements OnInit {
  // Calendar month & year
  currentYear = 2026;
  currentMonthIndex = 9; // October (0-indexed)
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  weekDayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Generated grid days (6 rows x 7 cols = 42 cells)
  calendarDays: CalendarDayView[] = [];

  // Selected date range
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  totalDaysCount: number = 0;

  // Form inputs
  selectedCategory: string = '';
  absenceReason: string = '';
  isHalfDay: boolean = false;
  halfDayType: 'First Half' | 'Second Half' = 'First Half';

  // Submission state
  isSubmitting = false;
  isSuccess = false;
  errorMessage = '';

  // Quota Map (Days available, populated from backend leave balances)
  leaveQuotas: Record<string, number> = {
    'Casual Leave': 8,
    'Sick Leave': 6,
    'Earned Leave': 12,
    'Comp-Off': 2,
    'Maternity/Paternity': 90,
  };

  // Fixed Holidays list in 2026 (Year-Month-Day format)
  holidaysList: Record<string, string> = {
    '2026-10-02': 'Gandhi Jayanti',
    '2026-10-20': 'Dussehra',
    '2026-11-01': 'Diwali',
    '2026-12-25': 'Christmas Day',
    '2026-01-26': 'Republic Day',
    '2026-08-15': 'Independence Day',
  };

  constructor(
    private router: Router,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonthIndex = today.getMonth();
    this.selectedStartDate = today;
    this.selectedEndDate = today;
    this.recalculateCalendar();
    this.leaveService.fetchMyLeaves$().subscribe({
      next: (res) => {
        if (res?.balances) {
          res.balances.forEach((b: any) => {
            if (b.type && b.available !== undefined) {
              this.leaveQuotas[b.type] = Number(b.available);
            }
          });
        }
      },
      error: () => {}
    });
  }

  get currentMonthTitle(): string {
    return `${this.monthNames[this.currentMonthIndex]} ${this.currentYear}`;
  }

  get availableQuotaDisplay(): string {
    if (!this.selectedCategory) return '--';
    const quota = this.leaveQuotas[this.selectedCategory];
    return quota !== undefined ? `${quota} Days` : '--';
  }

  get totalRequestedDisplay(): string {
    if (this.totalDaysCount <= 0) return '--';
    return this.totalDaysCount === 1 ? '1 Day' : `${this.totalDaysCount} Days`;
  }

  get selectionBadgeText(): string {
    if (!this.selectedStartDate) return 'Select a date';
    if (!this.selectedEndDate || this.selectedStartDate.getTime() === this.selectedEndDate.getTime()) {
      return this.formatDateStr(this.selectedStartDate);
    }
    return `${this.formatDateStr(this.selectedStartDate)} - ${this.formatDateStr(this.selectedEndDate)}`;
  }

  prevMonth(): void {
    if (this.currentMonthIndex === 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    } else {
      this.currentMonthIndex--;
    }
    this.recalculateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonthIndex === 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    } else {
      this.currentMonthIndex++;
    }
    this.recalculateCalendar();
  }

  recalculateCalendar(): void {
    const year = this.currentYear;
    const month = this.currentMonthIndex;

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Day of week: 0 = Sun, 1 = Mon, ... 6 = Sat
    // Convert to Monday = 0: (day + 6) % 7
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDayView[] = [];

    // 1. Previous month padded days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dNum);
      days.push(this.createDayView(prevDate, false));
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, month, d);
      days.push(this.createDayView(currDate, true));
    }

    // 3. Next month padded days to fill 42 cells (6 rows x 7 cols) or 35 cells
    const remaining = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
    for (let next = 1; next <= remaining; next++) {
      const nextDate = new Date(year, month + 1, next);
      days.push(this.createDayView(nextDate, false));
    }

    this.calendarDays = days;
    this.computeTotalWorkingDays();
  }

  private createDayView(date: Date, isCurrentMonth: boolean): CalendarDayView {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holidayName = this.holidaysList[key];
    const isHoliday = !!holidayName;

    const isToday = y === 2026 && date.getMonth() === 9 && date.getDate() === 24;

    const dateTime = this.stripTime(date).getTime();
    const startVal = this.selectedStartDate ? this.stripTime(this.selectedStartDate).getTime() : null;
    const endVal = this.selectedEndDate ? this.stripTime(this.selectedEndDate).getTime() : null;

    let isSelectedStart = false;
    let isSelectedEnd = false;
    let isInSelectedRange = false;

    if (startVal && !endVal) {
      isSelectedStart = dateTime === startVal;
    } else if (startVal && endVal) {
      isSelectedStart = dateTime === startVal;
      isSelectedEnd = dateTime === endVal;
      isInSelectedRange = dateTime >= startVal && dateTime <= endVal;
    }

    return {
      dayNumber: date.getDate(),
      date,
      isCurrentMonth,
      isToday,
      isWeekend,
      isHoliday,
      holidayName,
      isSelectedStart,
      isSelectedEnd,
      isInSelectedRange,
    };
  }

  selectDay(day: CalendarDayView): void {
    const clickedTime = this.stripTime(day.date).getTime();

    // If both dates selected or neither: start a new selection
    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate && this.selectedStartDate.getTime() !== this.selectedEndDate.getTime())) {
      this.selectedStartDate = day.date;
      this.selectedEndDate = day.date;
    } else {
      const startTime = this.stripTime(this.selectedStartDate).getTime();
      if (clickedTime < startTime) {
        // Clicked before current start -> make it the new start
        this.selectedStartDate = day.date;
        this.selectedEndDate = day.date;
      } else {
        // Range selection end
        this.selectedEndDate = day.date;
      }
    }

    this.recalculateCalendar();
  }

  private computeTotalWorkingDays(): void {
    if (!this.selectedStartDate || !this.selectedEndDate) {
      this.totalDaysCount = 0;
      return;
    }

    const start = this.stripTime(this.selectedStartDate).getTime();
    const end = this.stripTime(this.selectedEndDate).getTime();

    let count = 0;
    let cur = new Date(start);

    while (cur.getTime() <= end) {
      const dayOfWeek = cur.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      const isHoliday = !!this.holidaysList[key];

      // Leave days only count working days (exclude Saturday, Sunday, and Public Holidays)
      if (!isWeekend && !isHoliday) {
        count++;
      }

      cur.setDate(cur.getDate() + 1);
    }

    this.totalDaysCount = count;
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private formatDateStr(d: Date): string {
    const day = d.getDate();
    const month = this.monthNames[d.getMonth()].substring(0, 3);
    return `${day} ${month}`;
  }

  submitRequest(): void {
    this.errorMessage = '';

    if (!this.selectedCategory) {
      this.errorMessage = 'Please select a leave category.';
      return;
    }

    if (this.totalDaysCount <= 0) {
      this.errorMessage = 'Please select valid working dates for your leave duration.';
      return;
    }

    if (!this.absenceReason.trim()) {
      this.errorMessage = 'Please provide a reason for your absence.';
      return;
    }

    const available = this.leaveQuotas[this.selectedCategory];
    if (available !== undefined && this.totalDaysCount > available) {
      this.errorMessage = `Selected duration (${this.totalDaysCount} days) exceeds available ${this.selectedCategory} quota (${available} days).`;
      return;
    }

    this.isSubmitting = true;

    const startDateIso = this.selectedStartDate ? this.selectedStartDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const endDateIso = this.selectedEndDate ? this.selectedEndDate.toISOString().split('T')[0] : startDateIso;

    this.leaveService.applyLeave$({
      leaveType: this.selectedCategory,
      startDate: startDateIso,
      endDate: endDateIso,
      reason: this.absenceReason.trim()
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/employee/my-leaves']);
        }, 1200);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Unable to submit leave request. Please try again.';
      }
    });
  }
}
