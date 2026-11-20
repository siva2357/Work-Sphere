import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamService, TeamMemberDetail } from '../../../core/services/team.service';
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

export interface TeamFilterChip {
  key: 'search' | 'status' | 'department' | 'sort';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-team-management',
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
  templateUrl: './team-management.html',
  styleUrl: './team-management.css',
})
export class TeamManagement implements OnInit {
  private teamService = inject(TeamService);
  private router = inject(Router);
  private toaster = inject(ToasterService);

  @ViewChild('empIdTpl', { static: true }) empIdTpl!: TemplateRef<any>;
  @ViewChild('profileImgTpl', { static: true }) profileImgTpl!: TemplateRef<any>;
  @ViewChild('employeeTpl', { static: true }) employeeTpl!: TemplateRef<any>;
  @ViewChild('emailTpl', { static: true }) emailTpl!: TemplateRef<any>;
  @ViewChild('departmentTpl', { static: true }) departmentTpl!: TemplateRef<any>;
  @ViewChild('roleTpl', { static: true }) roleTpl!: TemplateRef<any>;
  @ViewChild('attendanceTpl', { static: true }) attendanceTpl!: TemplateRef<any>;
  @ViewChild('taskVelocityTpl', { static: true }) taskVelocityTpl!: TemplateRef<any>;
  @ViewChild('projectsTpl', { static: true }) projectsTpl!: TemplateRef<any>;
  @ViewChild('leaveHistoryTpl', { static: true }) leaveHistoryTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];

  // Draft Filter Inputs (bound to <app-input-field>)
  draftSearchQuery = '';
  draftStatus = 'ALL';
  draftDepartment = 'ALL';
  draftSort = 'attendanceDesc';

  // Applied Filter State
  searchQuery = '';
  selectedStatus = 'ALL';
  selectedDepartment = 'ALL';
  selectedSort = 'attendanceDesc';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  departments: string[] = [];

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Active', value: 'Active' },
    { label: 'Remote', value: 'Remote' },
    { label: 'On Leave', value: 'On Leave' },
  ];

  departmentFilterOptions: InputDropdownOption[] = [
    { label: 'All Departments', value: 'ALL' },
  ];

  readonly sortFilterOptions: InputDropdownOption[] = [
    { label: 'Attendance %: Highest First', value: 'attendanceDesc' },
    { label: 'Attendance %: Lowest First', value: 'attendanceAsc' },
    { label: 'Task Velocity %: Highest First', value: 'taskDesc' },
    { label: 'Leaves Taken: Most First', value: 'leavesDesc' },
    { label: 'Name: Alphabetical', value: 'nameAsc' },
  ];

  // Cached Data & View State
  teamMembers: (TeamMemberDetail & { sNo?: number })[] = [];
  filteredTeam: (TeamMemberDetail & { sNo?: number })[] = [];
  paginatedTeam: (TeamMemberDetail & { sNo?: number })[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: TeamFilterChip[] = [];

  totalMembersCount = 0;
  activeMembersCount = 0;
  remoteMembersCount = 0;
  onLeaveCount = 0;
  avgAttendance = 0;
  avgTaskVelocity = 0;

  ngOnInit(): void {
    this.initTableColumns();
    this.departments = this.teamService.availableDepartments;
    this.rebuildDepartmentOptions();
    this.updateTeamView();

    this.teamService.members$.subscribe((list) => {
      this.teamMembers = list || [];
      this.departments = this.teamService.availableDepartments;
      this.rebuildDepartmentOptions();
      this.updateTeamView();
    });
    this.teamService.refreshMembers();
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
        cellTemplate: this.employeeTpl,
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
        cellTemplate: this.roleTpl,
        width: 235,
      },
      {
        field: 'attendancePercentage',
        headerName: 'Attendance',
        cellTemplate: this.attendanceTpl,
        width: 125,
      },
      {
        field: 'taskCompletionRate',
        headerName: 'Tasks',
        cellTemplate: this.taskVelocityTpl,
        width: 140,
      },
      {
        field: 'projects',
        headerName: 'Projects',
        cellTemplate: this.projectsTpl,
        width: 125,
      },
      {
        field: 'totalLeavesTaken',
        headerName: 'Leaves',
        cellTemplate: this.leaveHistoryTpl,
        width: 120,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.statusTpl,
        width: 125,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.actionsTpl,
        width: 90,
      },
    ];
  }

  private rebuildDepartmentOptions(): void {
    this.departmentFilterOptions = [
      { label: 'All Departments', value: 'ALL' },
      ...this.departments.map((dep) => ({ label: dep, value: dep })),
    ];
  }

  private updateTeamView(): void {
    this.totalMembersCount = this.teamMembers.length;
    this.activeMembersCount = this.teamMembers.filter(
      (m) => m.status === 'Active' || m.status === 'Remote'
    ).length;
    this.remoteMembersCount = this.teamMembers.filter((m) => m.status === 'Remote').length;
    this.onLeaveCount = this.teamMembers.filter((m) => m.status === 'On Leave').length;

    if (this.teamMembers.length > 0) {
      const attSum = this.teamMembers.reduce((acc, m) => acc + m.attendancePercentage, 0);
      this.avgAttendance = Math.round((attSum / this.teamMembers.length) * 10) / 10;

      const taskSum = this.teamMembers.reduce((acc, m) => acc + m.taskCompletionRate, 0);
      this.avgTaskVelocity = Math.round((taskSum / this.teamMembers.length) * 10) / 10;
    } else {
      this.avgAttendance = 0;
      this.avgTaskVelocity = 0;
    }

    this.statCards = [
      {
        title: 'Active Workforce',
        value: `${this.totalMembersCount} Members`,
        subtitle: `Across ${this.departments.length || 1} engineering departments`,
        badgeText: 'Team',
        badgeType: 'emerald',
        icon: 'bi-people-fill',
      },
      {
        title: 'Team Attendance Rate',
        value: `${this.avgAttendance}% Avg`,
        subtitle: 'Reliability rating',
        badgeText: 'Reliable',
        badgeType: 'info',
        icon: 'bi-calendar-check-fill',
      },
      {
        title: 'Task Velocity Rate',
        value: `${this.avgTaskVelocity}% Completion`,
        subtitle: 'On-time sprint delivery',
        badgeText: 'Velocity',
        badgeType: 'success',
        icon: 'bi-check2-all',
      },
      {
        title: 'On Leave / Away',
        value: `${this.onLeaveCount} Engineers`,
        subtitle: 'Approved leave quota',
        badgeText: 'Leave',
        badgeType: 'warning',
        icon: 'bi-cup-hot-fill',
      },
    ];

    let result = [...this.teamMembers];

    if (this.selectedStatus !== 'ALL') {
      result = result.filter((m) => m.status === this.selectedStatus);
    }

    if (this.selectedDepartment !== 'ALL') {
      result = result.filter((m) => m.department === this.selectedDepartment);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (this.selectedSort === 'attendanceDesc') {
        return b.attendancePercentage - a.attendancePercentage;
      }
      if (this.selectedSort === 'attendanceAsc') {
        return a.attendancePercentage - b.attendancePercentage;
      }
      if (this.selectedSort === 'taskDesc') {
        return b.taskCompletionRate - a.taskCompletionRate;
      }
      if (this.selectedSort === 'leavesDesc') {
        return b.totalLeavesTaken - a.totalLeavesTaken;
      }
      if (this.selectedSort === 'nameAsc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    this.filteredTeam = result;

    const totalPages = Math.max(1, Math.ceil(this.filteredTeam.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedTeam = this.filteredTeam
      .slice(start, start + this.pageSize)
      .map((member, idx) => ({
        ...member,
        sNo: start + idx + 1,
      }));

    const chips: TeamFilterChip[] = [];
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
    this.selectedDepartment = this.draftDepartment || 'ALL';
    this.selectedSort = this.draftSort || 'attendanceDesc';
    this.currentPage = 1;
    this.updateTeamView();
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftStatus = 'ALL';
    this.draftDepartment = 'ALL';
    this.draftSort = 'attendanceDesc';
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedSort = 'attendanceDesc';
    this.currentPage = 1;
    this.updateTeamView();
  }

  refreshTeam(): void {
    this.teamService.refreshMembers();
    this.toaster.info('Team roster refreshed.', 'Refreshed');
  }

  removeFilterChip(key: TeamFilterChip['key']): void {
    if (key === 'search') {
      this.draftSearchQuery = '';
      this.searchQuery = '';
    } else if (key === 'status') {
      this.draftStatus = 'ALL';
      this.selectedStatus = 'ALL';
    } else if (key === 'department') {
      this.draftDepartment = 'ALL';
      this.selectedDepartment = 'ALL';
    } else if (key === 'sort') {
      this.draftSort = 'attendanceDesc';
      this.selectedSort = 'attendanceDesc';
    }
    this.currentPage = 1;
    this.updateTeamView();
  }

  setStatusFilter(status: string): void {
    this.draftStatus = status;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.updateTeamView();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateTeamView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateTeamView();
  }

  viewProfile(member: TeamMemberDetail): void {
    this.teamService.setSelectedMemberId(member.id);
    this.router.navigate(['/team-profile'], {
      queryParams: { id: member.id },
    });
  }

  changeStatus(
    member: TeamMemberDetail,
    newStatus: TeamMemberDetail['status'],
    event?: Event
  ): void {
    if (event) event.stopPropagation();
    this.teamService.updateEmployeeStatus(member.id, newStatus);
    this.teamMembers = this.teamService.getTeamMembers();
    this.updateTeamView();
    this.toaster.success(`Updated ${member.name}'s status to "${newStatus}".`, 'Status Updated');
  }

  deleteEmployee(member: TeamMemberDetail, event?: Event): void {
    if (event) event.stopPropagation();
    const confirmed = confirm(
      `Are you sure you want to offboard/remove ${member.name} (${member.id}) from the team directory?`
    );
    if (confirmed) {
      this.teamService.deleteEmployee(member.id);
      this.teamMembers = this.teamService.getTeamMembers();
      this.updateTeamView();
      this.toaster.warning(`Employee ${member.name} removed from active roster.`, 'Removed');
    }
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Active':
        return 'soft-emerald';
      case 'Remote':
        return 'soft-primary';
      case 'On Leave':
        return 'soft-warning';
      case 'Offline':
        return 'light';
      default:
        return 'light';
    }
  }

  getAttendanceBadgeVariant(percent: number): BadgeVariant {
    if (percent >= 96) return 'soft-emerald';
    if (percent >= 90) return 'soft-primary';
    return 'soft-danger';
  }

  getTaskProgressColor(percent: number): string {
    if (percent >= 92) return 'bg-emerald';
    if (percent >= 80) return 'bg-primary';
    return 'bg-warning';
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
}
