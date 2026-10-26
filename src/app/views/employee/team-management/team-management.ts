import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TeamService, TeamMemberDetail } from '../../../core/services/team.service';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './team-management.html',
  styleUrl: './team-management.css',
})
export class TeamManagement implements OnInit {
  teamMembers: TeamMemberDetail[] = [];

  // Filter & Search Controls
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedDepartment: string = 'ALL';
  selectedSort: string = 'attendanceDesc';

  // Available Filter Options
  departments: string[] = [];

  // Notification Toast
  actionToastMessage: string = '';
  private toastTimer: any;

  constructor(
    private teamService: TeamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.departments = this.teamService.availableDepartments;
    this.loadTeam();
  }

  loadTeam(): void {
    this.teamMembers = this.teamService.getTeamMembers();
  }

  // Filtered Team Members Getter
  get filteredTeam(): TeamMemberDetail[] {
    let result = [...this.teamMembers];

    // 1. Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((m) => m.status === this.selectedStatus);
    }

    // 2. Department Filter
    if (this.selectedDepartment !== 'ALL') {
      result = result.filter((m) => m.department === this.selectedDepartment);
    }

    // 3. Search Query
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

    // 4. Sorting
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

    return result;
  }

  // Top Metrics
  get totalMembersCount(): number {
    return this.teamMembers.length;
  }

  get activeMembersCount(): number {
    return this.teamMembers.filter((m) => m.status === 'Active' || m.status === 'Remote').length;
  }

  get onLeaveCount(): number {
    return this.teamMembers.filter((m) => m.status === 'On Leave').length;
  }

  get avgAttendance(): number {
    if (this.teamMembers.length === 0) return 0;
    const sum = this.teamMembers.reduce((acc, m) => acc + m.attendancePercentage, 0);
    return Math.round((sum / this.teamMembers.length) * 10) / 10;
  }

  get avgTaskVelocity(): number {
    if (this.teamMembers.length === 0) return 0;
    const sum = this.teamMembers.reduce((acc, m) => acc + m.taskCompletionRate, 0);
    return Math.round((sum / this.teamMembers.length) * 10) / 10;
  }

  // Filter actions
  setStatusFilter(status: string): void {
    this.selectedStatus = status;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedSort = 'attendanceDesc';
    this.loadTeam();
    this.showToast('Team directory filters reset.');
  }

  // Navigate to Individual Profile
  viewProfile(member: TeamMemberDetail): void {
    this.teamService.setSelectedMemberId(member.id);
    this.router.navigate(['/employee/team-profile'], {
      queryParams: { id: member.id },
    });
  }

  // Quick Status Change
  changeStatus(member: TeamMemberDetail, newStatus: TeamMemberDetail['status'], event?: Event): void {
    if (event) event.stopPropagation();
    this.teamService.updateEmployeeStatus(member.id, newStatus);
    this.loadTeam();
    this.showToast(`Updated ${member.name}'s status to ${newStatus}.`);
  }

  // Delete / Offboard Employee
  deleteEmployee(member: TeamMemberDetail, event?: Event): void {
    if (event) event.stopPropagation();
    const confirmed = confirm(`Are you sure you want to offboard/remove ${member.name} (${member.id}) from the team directory?`);
    if (confirmed) {
      this.teamService.deleteEmployee(member.id);
      this.loadTeam();
      this.showToast(`Employee ${member.name} removed from active roster.`);
    }
  }

  // Style Helpers
  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'Remote':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'On Leave':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Offline':
        return 'bg-light text-secondary border border-light-subtle';
      default:
        return 'bg-light text-dark';
    }
  }

  getAttendanceBadgeClass(percent: number): string {
    if (percent >= 96) return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
    if (percent >= 90) return 'bg-primary-subtle text-primary border border-primary-subtle';
    return 'bg-danger-subtle text-danger border border-danger-subtle';
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

  private showToast(message: string): void {
    this.actionToastMessage = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.actionToastMessage = '';
    }, 3500);
  }
}
