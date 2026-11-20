import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  TeamService,
  TeamMemberDetail,
  LeaveRecord,
  EmployeeProjectAssignment,
} from '../../../../core/services/team.service';
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
  Table,
  TableColumn,
  Toaster,
  ToasterService,
} from '../../../../library/UI/components';

@Component({
  selector: 'app-team-profile',
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
    Toaster,
  ],
  templateUrl: './team-profile.html',
  styleUrl: './team-profile.css',
})
export class TeamProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamService = inject(TeamService);
  private toaster = inject(ToasterService);

  @ViewChild('leaveIdTpl', { static: true }) leaveIdTpl!: TemplateRef<any>;
  @ViewChild('leaveTypeTpl', { static: true }) leaveTypeTpl!: TemplateRef<any>;
  @ViewChild('leaveDaysTpl', { static: true }) leaveDaysTpl!: TemplateRef<any>;
  @ViewChild('leaveStatusTpl', { static: true }) leaveStatusTpl!: TemplateRef<any>;

  @ViewChild('projCodeTpl', { static: true }) projCodeTpl!: TemplateRef<any>;
  @ViewChild('projRoleTpl', { static: true }) projRoleTpl!: TemplateRef<any>;
  @ViewChild('projProgressTpl', { static: true }) projProgressTpl!: TemplateRef<any>;

  leaveTableColumns: TableColumn[] = [];
  projectTableColumns: TableColumn[] = [];

  memberId = 'EMP-0135';
  member?: TeamMemberDetail;
  allMembers: TeamMemberDetail[] = [];
  memberDropdownOptions: InputDropdownOption[] = [];
  statCards: StatMetric[] = [];
  leaveRecordsWithSNo: (LeaveRecord & { sNo: number; dateRange: string })[] = [];
  projectRecordsWithSNo: (EmployeeProjectAssignment & { sNo: number })[] = [];

  activeTab: 'overview' | 'attendance' | 'tasks' | 'leaves' = 'overview';

  ngOnInit(): void {
    this.initTableColumns();

    this.teamService.members$.subscribe((list) => {
      this.allMembers = list || [];
      this.memberDropdownOptions = this.allMembers.map((m) => ({
        label: `${m.name} (${m.id}) — ${m.role}`,
        value: m.id,
      }));
      this.loadMember();
    });
    this.teamService.refreshMembers();

    this.route.queryParams.subscribe((params) => {
      const qId = params['id'];
      if (qId) {
        this.memberId = qId;
      } else {
        this.memberId = this.teamService.getSelectedMemberId();
      }
      this.loadMember();
    });
  }

  private initTableColumns(): void {
    this.leaveTableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 70,
      },
      {
        field: 'id',
        headerName: 'Leave ID',
        cellTemplate: this.leaveIdTpl,
        width: 115,
      },
      {
        field: 'type',
        headerName: 'Leave Type',
        cellTemplate: this.leaveTypeTpl,
        width: 150,
      },
      {
        field: 'dateRange',
        headerName: 'Date Range',
        width: 210,
      },
      {
        field: 'days',
        headerName: 'Duration',
        cellTemplate: this.leaveDaysTpl,
        width: 115,
      },
      {
        field: 'reason',
        headerName: 'Reason',
        width: 240,
      },
      {
        field: 'appliedOn',
        headerName: 'Applied On',
        width: 135,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.leaveStatusTpl,
        width: 125,
      },
    ];

    this.projectTableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 70,
      },
      {
        field: 'code',
        headerName: 'Project ID',
        cellTemplate: this.projCodeTpl,
        width: 125,
      },
      {
        field: 'title',
        headerName: 'Project Title',
        width: 260,
      },
      {
        field: 'role',
        headerName: 'Assigned Role',
        cellTemplate: this.projRoleTpl,
        width: 185,
      },
      {
        field: 'progressPercent',
        headerName: 'Completion',
        cellTemplate: this.projProgressTpl,
        width: 140,
      },
    ];
  }

  loadMember(): void {
    this.member = this.teamService.getMemberById(this.memberId);
    if (!this.member && this.allMembers.length > 0) {
      this.member = this.allMembers[0];
      this.memberId = this.member.id;
    }

    if (this.member) {
      this.statCards = [
        {
          title: 'Attendance Rating',
          value: `${this.member.attendancePercentage}%`,
          subtitle: `${this.member.presentDays} of ${this.member.totalWorkingDays} days present`,
          badgeText: this.member.attendancePercentage >= 95 ? 'Exemplary' : 'Tracked',
          badgeType: 'emerald',
          icon: 'bi-calendar-check-fill',
        },
        {
          title: 'Task Velocity Rate',
          value: `${this.member.taskCompletionRate}%`,
          subtitle: `${this.member.completedTasks} of ${this.member.totalTasksAssigned} tasks shipped`,
          badgeText: 'Velocity',
          badgeType: 'info',
          icon: 'bi-check2-all',
        },
        {
          title: 'Leaves Taken',
          value: `${this.member.totalLeavesTaken} Days`,
          subtitle: `${this.member.remainingAnnualLeaves + this.member.remainingCasualLeaves} days quota left`,
          badgeText: 'Leave Quota',
          badgeType: 'warning',
          icon: 'bi-cup-hot-fill',
        },
        {
          title: 'Active Projects',
          value: `${this.member.projects?.length || 1} Tracks`,
          subtitle: 'Core sprint contributor',
          badgeText: 'Active',
          badgeType: 'success',
          icon: 'bi-kanban-fill',
        },
      ];

      this.leaveRecordsWithSNo = (this.member.leaveHistory || []).map((rec, idx) => ({
        ...rec,
        sNo: idx + 1,
        dateRange: `${rec.startDate} → ${rec.endDate}`,
      }));

      this.projectRecordsWithSNo = (this.member.projects || []).map((proj, idx) => ({
        ...proj,
        sNo: idx + 1,
      }));
    }
  }

  switchMember(id: string): void {
    if (!id) return;
    this.memberId = id;
    this.teamService.setSelectedMemberId(id);
    this.loadMember();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id },
      queryParamsHandling: 'merge',
    });
  }

  setActiveTab(tab: 'overview' | 'attendance' | 'tasks' | 'leaves'): void {
    this.activeTab = tab;
  }

  copyEmail(email?: string): void {
    if (!email) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    this.toaster.success(`Copied ${email} to clipboard.`, 'Email Copied');
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Active':
        return 'soft-emerald';
      case 'Remote':
        return 'soft-primary';
      case 'On Leave':
        return 'soft-warning';
      default:
        return 'light';
    }
  }

  getLeaveStatusVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Approved':
        return 'soft-success';
      case 'Pending':
        return 'soft-warning';
      case 'Rejected':
        return 'soft-danger';
      default:
        return 'light';
    }
  }
}
