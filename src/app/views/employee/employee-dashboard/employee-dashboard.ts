import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { LeaveService } from '../../../core/services/leave.service';
import { TaskService } from '../../../core/services/task.service';
import { RequestService } from '../../../core/services/request.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { StatCards } from '../../../library/shared/components/stat-cards/stat-cards';
import {
  DayAttendance,
  QuickAction,
  RecentRequest,
  StatCard,
  TaskItem,
} from '../../../core/models/workspace.interface';
import {
  Badge,
  BadgeVariant,
  Button,
  Table,
  TableColumn,
} from '../../../library/UI/components';

export type { DayAttendance, QuickAction, RecentRequest, StatCard, TaskItem };

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCards, Badge, Button, Table],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private leaveService = inject(LeaveService);
  private taskService = inject(TaskService);
  private requestService = inject(RequestService);
  private workspaceService = inject(WorkspaceService);

  @ViewChild('reqIdTpl', { static: true }) reqIdTpl!: TemplateRef<any>;
  @ViewChild('reqTypeTpl', { static: true }) reqTypeTpl!: TemplateRef<any>;
  @ViewChild('reqDurationTpl', { static: true }) reqDurationTpl!: TemplateRef<any>;
  @ViewChild('reqDateTpl', { static: true }) reqDateTpl!: TemplateRef<any>;
  @ViewChild('reqStatusTpl', { static: true }) reqStatusTpl!: TemplateRef<any>;

  recentRequestsColumns: TableColumn[] = [];
  isLoadingRecentRequests = false;

  employeeName = '';
  employeeRole = '';
  employeeDepartment = '';
  profileImage =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';

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
  tasksCompletedCount = 0;
  taskPercentage = 0;

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

  readonly quickActions: QuickAction[] = [
    {
      title: 'Mark Attendance',
      description: 'Clock in / clock out & review daily hours',
      icon: 'bi-fingerprint',
      route: '/mark-attendance',
    },
    {
      title: 'Apply Leave',
      description: 'Request casual, medical, or annual time-off',
      icon: 'bi-calendar-plus',
      route: '/apply-leave',
    },
    {
      title: 'Raise Request',
      description: 'Submit WFH, expense claims, or equipment',
      icon: 'bi-send-plus',
      route: '/apply-request',
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
  recentRequests: (RecentRequest & { sNo?: number })[] = [];
  announcements: { tag: string; title: string; date: string; badge: string }[] = [];
  upcomingHolidays: { name: string; date: string; day: string; badge: string }[] = [];

  ngOnInit(): void {
    this.initRecentRequestsColumns();

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
        this.statCards[0] = {
          ...this.statCards[0],
          value: `${res.stats.attendancePercentage ?? 95}%`,
          subtitle: `${res.stats.presentDays ?? 0} of ${res.stats.totalWorkingDays ?? 22} Days logged`,
        };
        this.statCards = [...this.statCards];
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
        const totalAvail = res.balances.reduce(
          (acc: number, b: any) => acc + Number(b.available || 0),
          0
        );
        this.statCards[1] = {
          ...this.statCards[1],
          value: `${totalAvail} Days`,
          subtitle: res.balances.map((b: any) => `${b.available} ${b.shortCode}`).join(' · '),
        };
        this.statCards = [...this.statCards];
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
        this.statCards[2] = {
          ...this.statCards[2],
          value: res.summary.nextPayDate || 'Month End',
          subtitle: `Net Pay: ₹${Number(res.summary.currentMonthNetPay || 0).toLocaleString('en-IN')}`,
        };
        this.statCards = [...this.statCards];
      }
    });

    this.workspaceService.getMyDocuments$(empCode, 'Policy').subscribe((res: any) => {
      const docs = res?.documents || (Array.isArray(res) ? res : []);
      this.announcements = docs.slice(0, 3).map((d: any) => ({
        tag: d.categoryLabel || 'Company Policy',
        title: d.title || 'Company Update',
        date: d.issueDate || 'Recent',
        badge: 'Notice',
      }));
    });

    this.loadDashboardTasks();
    this.loadRecentRequests();
  }

  private initRecentRequestsColumns(): void {
    this.recentRequestsColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 70,
      },
      {
        field: 'id',
        headerName: 'Request ID',
        cellTemplate: this.reqIdTpl,
        width: 120,
      },
      {
        field: 'type',
        headerName: 'Category / Type',
        cellTemplate: this.reqTypeTpl,
        width: 190,
      },
      {
        field: 'duration',
        headerName: 'Priority',
        cellTemplate: this.reqDurationTpl,
        width: 115,
      },
      {
        field: 'date',
        headerName: 'Submitted Date',
        cellTemplate: this.reqDateTpl,
        width: 135,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.reqStatusTpl,
        width: 135,
      },
    ];
  }

  private loadDashboardTasks(): void {
    this.http.get<any[]>(API_ENDPOINTS.TASKS.BASE).subscribe({
      next: (rows) => {
        const list = rows || [];
        this.tasks = list.map((t, idx) => ({
          id: idx + 1,
          title: t.title || 'Task',
          dueDate: t.dueDate || 'Upcoming',
          completed: t.status === 'Completed',
          tag: t.category || t.project || 'Engineering',
        }));
        this.recalculateTaskStats();
      },
      error: () => {
        const allTasks = this.taskService.getTasks();
        this.tasks = allTasks.map((t, idx) => ({
          id: idx + 1,
          title: t.title,
          dueDate: t.dueDate,
          completed: t.status === 'Completed',
          tag: t.category || 'Engineering',
        }));
        this.recalculateTaskStats();
      },
    });
  }

  private recalculateTaskStats(): void {
    this.tasksCompletedCount = this.tasks.filter((t) => t.completed).length;
    this.taskPercentage = this.tasks.length
      ? Math.round((this.tasksCompletedCount / this.tasks.length) * 100)
      : 0;
    this.totalGoals = this.tasks.length;
    this.goalsAchieved = this.tasksCompletedCount;
  }

  private loadRecentRequests(): void {
    this.isLoadingRecentRequests = true;
    this.http
      .get<any[]>(API_ENDPOINTS.REQUESTS.BASE)
      .pipe(finalize(() => (this.isLoadingRecentRequests = false)))
      .subscribe({
        next: (rows) => {
          const list = rows || [];
          this.recentRequests = list.slice(0, 5).map((r, idx) => ({
            sNo: idx + 1,
            id: r.requestId || `REQ-${idx + 101}`,
            type: r.category || 'IT & System Access',
            date: r.submittedDate || 'Recent',
            duration: r.priority || 'Medium',
            status: (r.status || 'Pending') as RecentRequest['status'],
          }));
          const pendingReqs = list.filter(
            (r) =>
              r.status === 'Pending' ||
              r.status === 'Under Review' ||
              r.status === 'In Progress'
          ).length;
          this.statCards[3] = {
            ...this.statCards[3],
            value: `${pendingReqs} Pending`,
          };
          this.statCards = [...this.statCards];
        },
        error: () => {
          const reqs = this.requestService.getRequests();
          this.recentRequests = reqs.slice(0, 5).map((r, idx) => ({
            sNo: idx + 1,
            id: r.id,
            type: r.category,
            date: r.submittedDate,
            duration: r.priority,
            status: r.overallStatus,
          }));
          const pendingReqs = reqs.filter(
            (r) => r.overallStatus === 'Pending' || r.overallStatus === 'Under Review'
          ).length;
          this.statCards[3] = {
            ...this.statCards[3],
            value: `${pendingReqs} Pending`,
          };
          this.statCards = [...this.statCards];
        },
      });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  toggleTask(task: TaskItem): void {
    task.completed = !task.completed;
    this.recalculateTaskStats();
  }

  getPriorityBadgeVariant(priority?: string): BadgeVariant {
    switch (priority) {
      case 'Urgent':
      case 'High':
        return 'soft-danger';
      case 'Medium':
        return 'soft-warning';
      case 'Low':
        return 'light';
      default:
        return 'light';
    }
  }

  getRequestStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Approved':
        return 'soft-success';
      case 'Pending':
        return 'soft-warning';
      case 'Under Review':
      case 'In Progress':
        return 'soft-info';
      case 'Rejected':
        return 'soft-danger';
      default:
        return 'light';
    }
  }
}
