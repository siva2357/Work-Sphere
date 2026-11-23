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

  private readonly defaultTeamMembers: ProjectMember[] = [
    { id: 'EMP-0135', name: 'Priya Patel', role: 'Lead Architect & Senior Engineer', department: 'Core Web Platform', avatarColor: '#10b981' },
    { id: 'EMP-0112', name: 'David Chen', role: 'Database & Infrastructure Lead', department: 'Data & Cloud Platform', avatarColor: '#0ea5e9' },
    { id: 'EMP-0128', name: 'Alex Rivera', role: 'Lead UI/UX Designer', department: 'Product Design', avatarColor: '#8b5cf6' },
    { id: 'EMP-0142', name: 'Rohan Sharma', role: 'Full Stack Java Engineer', department: 'Platform Services', avatarColor: '#f59e0b' },
    { id: 'EMP-0164', name: 'Vikram Malhotra', role: 'Mobile Applications Developer', department: 'Mobile Engineering', avatarColor: '#6366f1' },
    { id: 'EMP-0171', name: 'Sneha Reddy', role: 'SecOps Specialist', department: 'Cybersecurity & IAM', avatarColor: '#14b8a6' },
    { id: 'EMP-0150', name: 'Neha Sharma', role: 'QA Automation Lead', department: 'Quality Assurance', avatarColor: '#ec4899' },
  ];

  teamMembersList: ProjectMember[] = [...this.defaultTeamMembers];
  private projects: ManagedProject[] = [];
  private readonly projectsSubject = new BehaviorSubject<ManagedProject[]>([]);
  readonly projects$ = this.projectsSubject.asObservable();

  private readonly defaultProjects: ManagedProject[] = [
    {
      id: 1,
      code: 'PRJ-IT-101',
      title: 'WorkSphere Enterprise Core v2.4',
      department: 'Information Technology',
      category: 'Core Web Platform',
      description: 'Revamping enterprise HRM core architecture with Angular standalone components, OAuth2 social SSO authentication, real-time activity sync, and microservices gateway integration.',
      startDate: '2026-01-15',
      endDate: '2026-11-30',
      duration: '10.5 Months',
      status: 'In Progress',
      priority: 'High',
      lead: {
        id: 'EMP-0135',
        name: 'Priya Patel',
        role: 'Lead Architect & Senior Engineer',
        department: 'Core Web Platform',
        avatarColor: '#10b981',
      },
      teamMembers: [
        { id: 'EMP-0128', name: 'Alex Rivera', role: 'UI/UX Lead', department: 'Design', avatarColor: '#8b5cf6' },
        { id: 'EMP-0142', name: 'Rohan Sharma', role: 'Full Stack Java', department: 'Backend', avatarColor: '#f59e0b' },
        { id: 'EMP-0150', name: 'Neha Sharma', role: 'QA Lead', department: 'QA', avatarColor: '#ec4899' },
      ],
      progressPercent: 65,
      budget: '$120,000',
      methodology: 'Agile Scrum',
      milestones: ['Architecture RFC signed', 'Database multi-tenant migration', 'Sprint 8 demo ready'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 2,
      code: 'PRJ-IT-102',
      title: 'Cloud Kubernetes Orchestration & Zero-Trust Mesh',
      department: 'Data & Cloud Platform',
      category: 'Cloud & DevOps',
      description: 'Multi-region AWS EKS Kubernetes cluster provisioning with Istio service mesh, mTLS enforcement, and automated horizontal pod autoscaling.',
      startDate: '2026-03-01',
      endDate: '2026-10-31',
      duration: '8.0 Months',
      status: 'In Progress',
      priority: 'Urgent',
      lead: {
        id: 'EMP-0112',
        name: 'David Chen',
        role: 'Database & Infrastructure Lead',
        department: 'Data Platform',
        avatarColor: '#0ea5e9',
      },
      teamMembers: [
        { id: 'EMP-0171', name: 'Sneha Reddy', role: 'SecOps Specialist', department: 'Security', avatarColor: '#14b8a6' },
      ],
      progressPercent: 45,
      budget: '$85,000',
      methodology: 'Kanban',
      milestones: ['EKS Control Plane provisioned', 'Istio mTLS verified', 'Load testing complete'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 3,
      code: 'PRJ-IT-103',
      title: 'AI Talent Screening & Recruitment Pipeline',
      department: 'Human Resources Tech',
      category: 'Data Platform & AI',
      description: 'Intelligent resume parsing, automated interview scheduling bot, interviewer feedback aggregation, and candidate onboarding dashboard.',
      startDate: '2026-04-01',
      endDate: '2026-12-15',
      duration: '8.5 Months',
      status: 'Planning',
      priority: 'Medium',
      lead: {
        id: 'EMP-0128',
        name: 'Alex Rivera',
        role: 'Lead UI/UX Designer',
        department: 'Product Design',
        avatarColor: '#8b5cf6',
      },
      teamMembers: [
        { id: 'EMP-0150', name: 'Neha Sharma', role: 'QA Automation', department: 'QA', avatarColor: '#ec4899' },
        { id: 'EMP-0135', name: 'Priya Patel', role: 'Frontend Lead', department: 'Core', avatarColor: '#10b981' },
      ],
      progressPercent: 15,
      budget: '$50,000',
      methodology: 'Agile Scrum',
      milestones: ['Candidate journey map', 'Resume parser webhook PoC', 'Interviewer grading modal'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 4,
      code: 'PRJ-IT-104',
      title: 'WorkSphere Mobile Self-Service Portal',
      department: 'Product Engineering',
      category: 'Mobile Engineering',
      description: 'Native Android and iOS workforce self-service experience with geolocation punch-in, instant leave requests, and digital ID card wallet.',
      startDate: '2026-02-10',
      endDate: '2026-11-20',
      duration: '9.3 Months',
      status: 'In Progress',
      priority: 'High',
      lead: {
        id: 'EMP-0164',
        name: 'Vikram Malhotra',
        role: 'Mobile Applications Developer',
        department: 'Mobile Engineering',
        avatarColor: '#6366f1',
      },
      teamMembers: [
        { id: 'EMP-0128', name: 'Alex Rivera', role: 'Mobile UI/UX', department: 'Design', avatarColor: '#8b5cf6' },
      ],
      progressPercent: 80,
      budget: '$95,000',
      methodology: 'Agile Scrum',
      milestones: ['Biometric auth module', 'Offline sync engine', 'App Store submission prep'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 5,
      code: 'PRJ-IT-105',
      title: 'Unified Single Sign-On & OAuth2 Identity Gateway',
      department: 'Cybersecurity & IAM',
      category: 'Cybersecurity & IAM',
      description: 'Zero-trust enterprise IAM layer enforcing passwordless FIDO2 authentication, role-based access control, and audit trail ledger.',
      startDate: '2026-01-05',
      endDate: '2026-08-31',
      duration: '7.8 Months',
      status: 'Completed',
      priority: 'High',
      lead: {
        id: 'EMP-0171',
        name: 'Sneha Reddy',
        role: 'Cloud & SecOps Specialist',
        department: 'Cybersecurity & IAM',
        avatarColor: '#14b8a6',
      },
      teamMembers: [
        { id: 'EMP-0112', name: 'David Chen', role: 'Database Lead', department: 'Data', avatarColor: '#0ea5e9' },
      ],
      progressPercent: 100,
      budget: '$65,000',
      methodology: 'Milestone',
      milestones: ['SAML 2.0 integration', 'FIDO2 WebAuthn keys', 'External penetration test clean'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 6,
      code: 'PRJ-IT-106',
      title: 'Automated Payroll Compliance & Tax Deduction Engine',
      department: 'Finance & Payroll Ops',
      category: 'Enterprise Automation',
      description: 'Automated monthly salary calculation, PF and tax deductions, automatic payslip PDF rendering, and direct bank disbursement dispatch.',
      startDate: '2026-05-01',
      endDate: '2026-11-25',
      duration: '6.8 Months',
      status: 'In Progress',
      priority: 'Urgent',
      lead: {
        id: 'EMP-0142',
        name: 'Rohan Sharma',
        role: 'Full Stack Java Engineer',
        department: 'Platform Services',
        avatarColor: '#f59e0b',
      },
      teamMembers: [
        { id: 'EMP-0150', name: 'Neha Sharma', role: 'QA Automation', department: 'QA', avatarColor: '#ec4899' },
      ],
      progressPercent: 90,
      budget: '$75,000',
      methodology: 'Agile Scrum',
      milestones: ['Statutory tax rules calculator', 'Payslip PDF renderer', 'Dry run payroll cycle'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
  ];

  constructor() {
    this.projects = [...this.defaultProjects];
    this.availableDepartments = [
      'Information Technology',
      'Product Engineering',
      'Data & Cloud Platform',
      'Product Design (UI/UX)',
      'Cybersecurity & IAM',
      'Human Resources Tech',
      'Finance & Payroll Ops',
    ];
    this.loadDepartmentsAndMembers();
    this.refreshProjectsFromBackend();
  }

  refreshProjects(): void {
    this.refreshProjectsFromBackend();
  }

  private loadDepartmentsAndMembers(): void {
    const palette = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

    this.dropdownService.departments$.subscribe((depts) => {
      if (Array.isArray(depts) && depts.length > 0) {
        this.availableDepartments = depts.map((d) => d.name);
      }
    });

    this.http
      .get<{ members?: any[] }>(API_ENDPOINTS.WORKSPACE.TEAM_MEMBERS)
      .pipe(catchError(() => of({ members: [] })))
      .subscribe((res) => {
        if (res?.members && res.members.length > 0) {
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
        if (res?.projects && res.projects.length > 0) {
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
        } else {
          this.projects = [...this.defaultProjects];
        }
        this.projectsSubject.next([...this.projects]);
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
