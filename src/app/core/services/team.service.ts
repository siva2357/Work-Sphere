import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AuthService } from './auth.service';
import { DropdownService } from './dropdown.service';
import {
  EmployeeProjectAssignment,
  TeamMemberDetail,
} from '../models/task-project-team.interface';
import { TeamMemberLeaveRecord as LeaveRecord } from '../models/leave.interface';

export type { EmployeeProjectAssignment, LeaveRecord, TeamMemberDetail };

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly dropdownService = inject(DropdownService);
  private selectedMemberId: string = 'EMP-005';

  availableDepartments: string[] = [];
  private members: TeamMemberDetail[] = [];
  private readonly membersSubject = new BehaviorSubject<TeamMemberDetail[]>([]);
  readonly members$ = this.membersSubject.asObservable();

  constructor() {
    this.loadDepartments();
    this.refreshMembersFromBackend();
  }

  refreshMembers(): void {
    this.refreshMembersFromBackend();
  }

  private loadDepartments(): void {
    this.dropdownService.departments$.subscribe((depts) => {
      if (Array.isArray(depts)) {
        this.availableDepartments = depts.map((d) => d.name);
      }
    });
  }

  /**
   * Syncs Team Members directly from PostgreSQL (GET /api/teams/members).
   */
  refreshMembersFromBackend(): void {
    const palette = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

    this.http
      .get<{ members?: any[] }>(API_ENDPOINTS.WORKSPACE.TEAM_MEMBERS)
      .pipe(catchError(() => of({ members: [] })))
      .subscribe((res) => {
        if (res?.members) {
          this.members = res.members.map((m, idx) => ({
            id: m.id || `EMP-00${idx + 1}`,
            name: m.name,
            role: m.role || 'Software Engineer',
            designation: `${m.role} (${m.level || 'L8'})`,
            department: m.department || 'Engineering',
            email: m.email || `${m.name.toLowerCase().replace(/\s+/g, '.')}@worksphere.com`,
            phone: m.phone || '+91 98450 11223',
            location: m.location || 'Bangalore, India',
            avatarColor: palette[idx % palette.length],
            joinedDate: m.joiningDate || '12 Jan 2024',
            status: m.status || 'Active',
            employmentType: 'Full-Time',
            attendancePercentage: Number(m.attendancePercent || 95),
            totalWorkingDays: 22,
            presentDays: 21,
            lateDays: 0,
            absentDays: 1,
            taskCompletionRate: Number(m.taskMetrics?.completionRate || 92),
            totalTasksAssigned: Number(m.taskMetrics?.totalAssigned || 6),
            completedTasks: Number(m.taskMetrics?.completed || 5),
            pendingTasks: Number(m.taskMetrics?.inProgress || 1),
            overdueTasks: Number(m.taskMetrics?.overdue || 0),
            totalLeavesTaken: Number(m.leavesTaken || 3),
            remainingCasualLeaves: 9,
            remainingSickLeaves: 6,
            remainingAnnualLeaves: 12,
            leaveHistory: [],
            projects: Array.isArray(m.assignedProjects)
              ? m.assignedProjects.map((p: any) => ({
                  code: p.id || 'PRJ-101',
                  title: p.name || 'WorkSphere Enterprise Core',
                  role: p.roleInProject || m.role,
                  progressPercent: 72,
                }))
              : [],
            skills: Array.isArray(m.skills)
              ? m.skills
              : ['TypeScript', 'ASP.NET Core', 'PostgreSQL', 'Angular'],
            bio: `${m.role} in ${m.department} contributing to WorkSphere enterprise delivery.`,
            emergencyContact: {
              name: 'Primary Emergency Contact',
              relationship: 'Family',
              phone: '+91 98450 99000',
            },
          }));
          this.membersSubject.next([...this.members]);
        }
      });
  }

  getTeamMembers(): TeamMemberDetail[] {
    return [...this.members];
  }

  getMemberById(id: string): TeamMemberDetail | undefined {
    return this.members.find((m) => m.id === id) || this.members[0];
  }

  setSelectedMemberId(id: string): void {
    this.selectedMemberId = id;
  }

  getSelectedMemberId(): string {
    return this.selectedMemberId;
  }

  addEmployee(data: {
    id?: string;
    name: string;
    role: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
    location: string;
    avatarColor?: string;
    employmentType: 'Full-Time' | 'Contractor' | 'Intern';
    skills?: string[];
    bio?: string;
    projects?: EmployeeProjectAssignment[];
  }): TeamMemberDetail {
    const nextNum = 172 + this.members.length;
    const assignedId = data.id?.trim() || `EMP-0${nextNum}`;
    const palette = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];
    const assignedColor = data.avatarColor || palette[Math.floor(Math.random() * palette.length)];

    const newMember: TeamMemberDetail = {
      id: assignedId,
      name: data.name.trim(),
      role: data.role.trim() || 'Software Engineer',
      designation: data.designation.trim() || 'Software Engineer I',
      department: data.department || 'Engineering',
      email: data.email.trim(),
      phone: data.phone.trim(),
      location: data.location.trim(),
      avatarColor: assignedColor,
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      employmentType: data.employmentType || 'Full-Time',
      attendancePercentage: 100.0,
      totalWorkingDays: 20,
      presentDays: 20,
      lateDays: 0,
      absentDays: 0,
      taskCompletionRate: 100.0,
      totalTasksAssigned: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      totalLeavesTaken: 0,
      remainingCasualLeaves: 12,
      remainingSickLeaves: 10,
      remainingAnnualLeaves: 18,
      leaveHistory: [],
      projects: data.projects || [],
      skills: data.skills || [],
      bio: data.bio?.trim() || '',
      emergencyContact: {
        name: 'Family Contact',
        relationship: 'Emergency',
        phone: data.phone.trim(),
      },
    };

    this.members.unshift(newMember);
    return newMember;
  }

  updateEmployeeStatus(id: string, status: TeamMemberDetail['status']): void {
    const member = this.members.find((m) => m.id === id);
    if (member) {
      member.status = status;
    }
  }

  deleteEmployee(id: string): void {
    this.members = this.members.filter((m) => m.id !== id);
  }

  resetToDefaults(): void {
    this.refreshMembersFromBackend();
  }
}
