import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AuthService } from './auth.service';
import { DropdownService } from './dropdown.service';
import { ManagedProject, ProjectMember } from '../models/task-project-team.interface';

export type { ManagedProject, ProjectMember };

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly dropdownService = inject(DropdownService);

  availableDepartments: string[] = [];
  readonly availableCategories: string[] = [
    'Core Web Platform',
    'Cloud & DevOps',
    'Mobile Engineering',
    'Cybersecurity & IAM',
    'Data Platform & AI',
    'Enterprise Automation',
    'Design System & UX',
  ];

  teamMembersList: ProjectMember[] = [];
  private projects: ManagedProject[] = [];
  private readonly projectsSubject = new BehaviorSubject<ManagedProject[]>([]);
  readonly projects$ = this.projectsSubject.asObservable();

  constructor() {
    this.loadDepartmentsAndMembers();
    this.refreshProjectsFromBackend();
  }

  refreshProjects(): void {
    this.refreshProjectsFromBackend();
  }

  private loadDepartmentsAndMembers(): void {
    const palette = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

    this.dropdownService.departments$.subscribe((depts) => {
      if (Array.isArray(depts)) {
        this.availableDepartments = depts.map((d) => d.name);
      }
    });

    this.http
      .get<{ members?: any[] }>(API_ENDPOINTS.WORKSPACE.TEAM_MEMBERS)
      .pipe(catchError(() => of({ members: [] })))
      .subscribe((res) => {
        if (res?.members) {
          this.teamMembersList = res.members.map((m, idx) => ({
            id: m.id,
            name: m.name,
            role: m.role || 'Engineer',
            department: m.department || 'Engineering',
            avatarColor: palette[idx % palette.length],
          }));
        }
      });
  }

  /**
   * Syncs Projects directly from PostgreSQL (GET /api/projects).
   */
  refreshProjectsFromBackend(): void {
    const palette = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

    this.http
      .get<{ projects?: any[] }>(API_ENDPOINTS.WORKSPACE.PROJECTS)
      .pipe(catchError(() => of({ projects: [] })))
      .subscribe((res) => {
        if (res?.projects) {
          this.projects = res.projects.map((p, idx) => ({
            id: idx + 1,
            code: p.code || `PRJ-${101 + idx}`,
            title: p.name || 'WorkSphere Enterprise Platform',
            department: p.department || 'Engineering & Software Development',
            category: p.category || 'Core Web Platform',
            description: p.description || '',
            startDate: p.startDate || '2026-01-15',
            endDate: p.endDate || '2026-11-30',
            duration: '6.0 Months',
            status: p.status || 'In Progress',
            priority: p.priority || 'High',
            lead: p.lead
              ? {
                  id: p.lead.id,
                  name: p.lead.name,
                  role: p.lead.role,
                  department: p.lead.department,
                  avatarColor: palette[idx % palette.length],
                }
              : this.teamMembersList[0] || {
                  id: 'EMP-004',
                  name: 'Project Lead',
                  role: 'Manager',
                  department: 'Engineering',
                  avatarColor: '#10b981',
                },
            teamMembers: Array.isArray(p.teamMembers)
              ? p.teamMembers.map((m: any, mIdx: number) => ({
                  id: m.id,
                  name: m.name,
                  role: m.role,
                  department: m.department,
                  avatarColor: palette[(idx + mIdx) % palette.length],
                }))
              : [],
            progressPercent: Number(p.progressPercent || 45),
            budget: p.budget || '$75,000',
            methodology: p.methodology || 'Agile Scrum',
            milestones: Array.isArray(p.milestones)
              ? p.milestones
              : ['Architecture Freeze', 'API Integration', 'UAT Sign-off'],
            externalToolUrl:
              p.externalToolUrl || 'https://habit-tracker-lake-zeta.vercel.app/login',
          }));
          this.projectsSubject.next([...this.projects]);
        }
      });
  }

  getProjects(): ManagedProject[] {
    return [...this.projects];
  }

  addProject(data: {
    title: string;
    department: string;
    category: string;
    description: string;
    startDate: string;
    endDate: string;
    leadId: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    methodology: 'Agile Scrum' | 'Kanban' | 'Waterfall' | 'Milestone';
    budget?: string;
    teamMemberIds?: string[];
    milestones?: string[];
    externalToolUrl?: string;
  }): ManagedProject {
    const nextId = this.projects.length + 1;
    const nextCode = `PRJ-IT-${100 + nextId}`;

    const lead =
      this.teamMembersList.find((m) => m.id === data.leadId) ||
      this.teamMembersList[0] || {
        id: data.leadId || 'EMP-004',
        name: 'Project Lead',
        role: 'Manager',
        department: data.department || 'Engineering',
        avatarColor: '#10b981',
      };

    const team = (data.teamMemberIds || [])
      .map((id) => this.teamMembersList.find((m) => m.id === id))
      .filter((m): m is ProjectMember => !!m);

    let duration = '6.0 Months';
    if (data.startDate && data.endDate) {
      const s = new Date(data.startDate).getTime();
      const e = new Date(data.endDate).getTime();
      const diffMonths = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24 * 30)));
      duration = `${diffMonths} Months`;
    }

    const newProject: ManagedProject = {
      id: nextId,
      code: nextCode,
      title: data.title.trim(),
      department: data.department || 'Information Technology',
      category: data.category || 'General',
      description: data.description.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      duration: duration,
      status: 'In Progress',
      priority: data.priority || 'Medium',
      lead: lead,
      teamMembers: team.length > 0 ? team : [lead],
      progressPercent: 10,
      budget: data.budget ? `$${data.budget.replace(/[^0-9]/g, '')}` : '$50,000',
      methodology: data.methodology || 'Agile Scrum',
      milestones:
        data.milestones && data.milestones.length > 0
          ? data.milestones
          : ['Project Kickoff & Architecture RFC'],
      externalToolUrl: data.externalToolUrl || 'https://habit-tracker-lake-zeta.vercel.app/login',
    };

    this.projects.unshift(newProject);

    this.http
      .post(API_ENDPOINTS.WORKSPACE.PROJECTS, {
        name: newProject.title,
        code: newProject.code,
        description: newProject.description,
        departmentCode: 'ENG',
        leadEmployeeCode: data.leadId || this.authService.getCurrentManagerCode(),
        teamMemberCodes: data.teamMemberIds || ['EMP-004', 'EMP-005'],
        category: newProject.category,
        priority: newProject.priority,
        status: newProject.status,
        budget: newProject.budget,
        methodology: newProject.methodology,
        milestones: newProject.milestones,
        externalToolUrl: newProject.externalToolUrl,
      })
      .pipe(catchError(() => of(null)))
      .subscribe(() => this.refreshProjectsFromBackend());

    return newProject;
  }

  updateProjectStatus(id: number, status: ManagedProject['status']): void {
    const prj = this.projects.find((p) => p.id === id);
    if (prj) {
      prj.status = status;
      if (status === 'Completed') prj.progressPercent = 100;
      else if (status === 'Planning') prj.progressPercent = 15;
      else if (status === 'In Progress' && prj.progressPercent === 0) prj.progressPercent = 35;
    }
  }

  deleteProject(id: number): void {
    this.projects = this.projects.filter((p) => p.id !== id);
  }

  resetToDefaults(): void {
    this.refreshProjectsFromBackend();
  }
}
