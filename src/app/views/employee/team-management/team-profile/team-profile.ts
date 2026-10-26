import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService, TeamMemberDetail, LeaveRecord } from '../../../../core/services/team.service';

@Component({
  selector: 'app-team-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './team-profile.html',
  styleUrl: './team-profile.css',
})
export class TeamProfile implements OnInit {
  memberId: string = 'EMP-0135';
  member?: TeamMemberDetail;
  allMembers: TeamMemberDetail[] = [];
  activeTab: 'overview' | 'attendance' | 'tasks' | 'leaves' = 'overview';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.allMembers = this.teamService.getTeamMembers();

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

  loadMember(): void {
    this.member = this.teamService.getMemberById(this.memberId);
    if (!this.member && this.allMembers.length > 0) {
      this.member = this.allMembers[0];
      this.memberId = this.member.id;
    }
  }

  switchMember(id: string): void {
    this.memberId = id;
    this.loadMember();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: id },
      queryParamsHandling: 'merge',
    });
  }

  setActiveTab(tab: 'overview' | 'attendance' | 'tasks' | 'leaves'): void {
    this.activeTab = tab;
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'Active':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'Remote':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'On Leave':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      default:
        return 'bg-light text-secondary border';
    }
  }

  getAttendanceColor(percent: number): string {
    if (percent >= 96) return 'text-emerald';
    if (percent >= 90) return 'text-primary';
    return 'text-danger';
  }
}
