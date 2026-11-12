import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { LeaveService } from '../../../core/services/leave.service';
import { TaskService } from '../../../core/services/task.service';
import { RequestService } from '../../../core/services/request.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import {
  DayAttendance,
  QuickAction,
  RecentRequest,
  StatCard,
  TaskItem,
} from '../../../core/models/workspace.interface';

export type { DayAttendance, QuickAction, RecentRequest, StatCard, TaskItem };

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private leaveService = inject(LeaveService);
  private taskService = inject(TaskService);
  private requestService = inject(RequestService);
  private workspaceService = inject(WorkspaceService);

  employeeName = '';
  employeeRole = '';
  employeeDepartment = '';
  profileImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';

  currentDateTime = new Date();
  private timerInterval: any;

  isClockedIn = true;
  clockInTime = '09:05 AM';
  elapsedHours = 4;
  elapsedMinutes = 30;

  performanceScore = 92;
  performanceRating = 4.6;
  goalsAchieved = 0;
  totalGoals = 0;

  tasks: TaskItem[] = [];

  get tasksCompletedCount(): number {
    return this.tasks.filter((t) => t.completed).length;
  }

  get taskPercentage(): number {
    if (!this.tasks.length) return 0;
    return Math.round((this.tasksCompletedCount / this.tasks.length) * 100);
  }

  statCards: StatCard[] = [
    {
      title: 'Attendance Rate',
      value: '0%',
      subtitle: 'Synced from Attendance Logs',
      icon: 'bi-calendar-check',
      route: '/my-attendance',
      badgeText: 'Live',
      badgeType: 'success',
    },
    {
      title: 'Leave Balance',
      value: '0 Days',
      subtitle: 'Casual · Sick · Earned',
      icon: 'bi-calendar2-week',
      route: '/my-leaves',
      badgeText: 'Available',
      badgeType: 'emerald',
    },
    {
      title: 'Next Payday',
      value: 'Month End',
      subtitle: 'Synced from Payroll',
      icon: 'bi-cash-coin',
      route: '/my-payroll',
      badgeText: 'On Schedule',
      badgeType: 'success',
    },
    {
      title: 'Active Requests',
      value: '0 Pending',
      subtitle: 'Multi-Stage Approval',
      icon: 'bi-inbox',
      route: '/my-requests',
      badgeText: 'Under Review',
      badgeType: 'warning',
    },
  ];

  quickActions: QuickAction[] = [
    {
      title: 'Mark Attendance',
      description: 'Clock in / clock out & review daily hours',
      icon: 'bi-clock-history',
      route: '/my-attendance',
    },
    {
      title: 'Apply Leave',
      description: 'Request casual, medical, or annual time-off',
      icon: 'bi-calendar-plus',
      route: '/my-leaves',
    },
    {
      title: 'Raise Request',
      description: 'Submit WFH, expense claims, or equipment',
      icon: 'bi-send-plus',
      route: '/my-requests',
    },
    {
      title: 'My Payroll',
      description: 'Download monthly payslips & tax breakdown',
      icon: 'bi-receipt-cutoff',
      route: '/my-payroll',
    },
    {
      title: 'My Letters',
      description: 'Access offer, appointment, & appraisal documents',
      icon: 'bi-award',
      route: '/my-documents',
    },
  ];

  weeklyHours: DayAttendance[] = [];
  recentRequests: RecentRequest[] = [];
  announcements: { tag: string; title: string; date: string; badge: string }[] = [];
  upcomingHolidays: { name: string; date: string; day: string; badge: string }[] = [];

  ngOnInit(): void {
    this.timerInterval = setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.employeeName = user.fullName;
        this.employeeRole = user.designationTitle || user.levelName || 'Employee';
        this.employeeDepartment = user.departmentName || '';
      }
    });

    const empCode = this.authService.getCurrentEmployeeCode();

    this.attendanceService.fetchMyAttendance$(empCode).subscribe((res: any) => {
      if (res?.stats) {
        this.statCards[0].value = `${res.stats.attendancePercentage ?? 95}%`;
        this.statCards[0].subtitle = `${res.stats.presentDays ?? 0} of ${res.stats.totalWorkingDays ?? 22} Days logged`;
      }
      if (Array.isArray(res?.logs)) {
        this.weeklyHours = res.logs.slice(0, 5).map((l: any) => ({
          day: (l.dayName || 'Mon').substring(0, 3),
          date: l.date || '',
          hours: parseFloat(l.hoursPresent) || 8,
          percentage: 90,
          status: 'completed' as const,
        }));
      }
    });

    this.leaveService.fetchMyLeaves$(empCode).subscribe((res: any) => {
      if (Array.isArray(res?.balances)) {
        const totalAvail = res.balances.reduce((acc: number, b: any) => acc + Number(b.available || 0), 0);
        this.statCards[1].value = `${totalAvail} Days`;
        this.statCards[1].subtitle = res.balances
          .map((b: any) => `${b.available} ${b.shortCode}`)
          .join(' · ');
      }
      if (Array.isArray(res?.upcomingHolidays)) {
        this.upcomingHolidays = res.upcomingHolidays.map((h: any) => ({
          name: h.name,
          date: h.date,
          day: h.day,
          badge: h.type || 'Holiday',
        }));
      }
    });

    this.workspaceService.getMyPayroll$(empCode).subscribe((res: any) => {
      if (res?.summary) {
        this.statCards[2].value = res.summary.nextPayDate || 'Month End';
        this.statCards[2].subtitle = `Net Pay: ₹${Number(res.summary.currentMonthNetPay || 0).toLocaleString('en-IN')}`;
      }
    });

    const allTasks = this.taskService.getTasks();
    this.tasks = allTasks.map((t, idx) => ({
      id: idx + 1,
      title: t.title,
      dueDate: t.dueDate,
      completed: t.status === 'Completed',
      tag: t.category || 'Engineering',
    }));
    this.totalGoals = this.tasks.length;
    this.goalsAchieved = this.tasksCompletedCount;

    const reqs = this.requestService.getRequests();
    this.recentRequests = reqs.slice(0, 4).map((r) => ({
      id: r.id,
      type: r.category,
      date: r.submittedDate,
      duration: r.priority,
      status: r.overallStatus,
    }));
    const pendingReqs = reqs.filter((r) => r.overallStatus === 'Pending' || r.overallStatus === 'Under Review').length;
    this.statCards[3].value = `${pendingReqs} Pending`;
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  toggleClock(): void {
    const action = this.isClockedIn ? 'PUNCH_OUT' : 'PUNCH_IN';
    this.attendanceService.markAttendance$({ action }).subscribe(() => {
      this.isClockedIn = !this.isClockedIn;
      if (this.isClockedIn) {
        const now = new Date();
        this.clockInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    });
  }

  toggleTask(task: TaskItem): void {
    task.completed = !task.completed;
  }
}
