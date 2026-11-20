import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AuthService } from './auth.service';
import { ManagedTask, TeamMember } from '../models/task-project-team.interface';

export type { ManagedTask, TeamMember };

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  teamMembers: TeamMember[] = [];
  availableProjects: string[] = [];
  private tasks: ManagedTask[] = [];
  private readonly tasksSubject = new BehaviorSubject<ManagedTask[]>([]);
  readonly tasks$ = this.tasksSubject.asObservable();

  private readonly defaultTasks: ManagedTask[] = [
    {
      sNo: 1,
      id: 'TSK-2001',
      title: 'Implement OAuth2 Social Authentication & Session Invalidation',
      project: 'WorkSphere Enterprise Core v2.4',
      description: 'Integrate Google and Microsoft 365 OAuth2 single sign-on flows with secure session invalidation and token refresh mechanism.',
      assignee: {
        id: 'EMP-0135',
        name: 'Priya Patel',
        role: 'Senior Angular Frontend Engineer',
        department: 'Core Web Platform',
        email: 'priya.patel@worksphere.io',
        avatarColor: '#10b981',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-18',
      dueDate: '2026-10-28',
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 28,
      loggedHours: 18.5,
      progressPercent: 65,
      category: 'Frontend Engineering',
      subtasks: ['Setup Google Developer Console', 'Implement PKCE flow', 'Token storage audit'],
    },
    {
      sNo: 2,
      id: 'TSK-2002',
      title: 'Optimize PostgreSQL Database Connection Pooling & Latency',
      project: 'WorkSphere HR Suite',
      description: 'Tune connection pooling parameters and add compound indexes for multi-tenant employee records query optimization.',
      assignee: {
        id: 'EMP-0112',
        name: 'David Chen',
        role: 'Database & Infrastructure Lead',
        department: 'Data Platform',
        email: 'david.chen@worksphere.io',
        avatarColor: '#0ea5e9',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-15',
      dueDate: '2026-10-25',
      status: 'In Progress',
      priority: 'Urgent',
      estimatedHours: 35,
      loggedHours: 24,
      progressPercent: 70,
      category: 'Database & Infrastructure',
      subtasks: ['PgBouncer pool configuration', 'Slow query log analysis', 'Benchmark p99 latency'],
    },
    {
      sNo: 3,
      id: 'TSK-2003',
      title: 'Design Mobile App Dark Mode Interface & Design System Tokens',
      project: 'Employee Self-Service Mobile Application',
      description: 'Create high-fidelity Figma components, semantic color tokens, and accessibility contrast compliant dark theme specifications.',
      assignee: {
        id: 'EMP-0128',
        name: 'Alex Rivera',
        role: 'Lead UI/UX Designer',
        department: 'Product Design',
        email: 'alex.rivera@worksphere.io',
        avatarColor: '#8b5cf6',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-10',
      dueDate: '2026-10-22',
      status: 'Completed',
      priority: 'Medium',
      estimatedHours: 20,
      loggedHours: 20,
      progressPercent: 100,
      category: 'Product Design',
      subtasks: ['Contrast compliance audit', 'Figma color tokens library', 'Design handoff review'],
    },
    {
      sNo: 4,
      id: 'TSK-2004',
      title: 'Automate End-to-End Cypress Integration Test Workflows',
      project: 'Payroll Automation Engine',
      description: 'Implement automated test suites covering payroll calculation runs, payslip generation, and tax deduction compliance.',
      assignee: {
        id: 'EMP-0150',
        name: 'Neha Sharma',
        role: 'QA Automation Lead',
        department: 'Quality Assurance',
        email: 'neha.sharma@worksphere.io',
        avatarColor: '#ec4899',
      },
      assignedBy: {
        name: 'David Chen',
        employeeId: 'EMP-0112',
        role: 'Infrastructure Lead',
      },
      assignedDate: '2026-10-20',
      dueDate: '2026-11-02',
      status: 'Pending',
      priority: 'High',
      estimatedHours: 24,
      loggedHours: 0,
      progressPercent: 0,
      category: 'Quality Assurance',
      subtasks: ['Test suite architecture', 'Mock payroll API fixtures', 'CI GitHub Actions pipeline'],
    },
    {
      sNo: 5,
      id: 'TSK-2005',
      title: 'Implement Multi-Level Dynamic Request Approval Hierarchy',
      project: 'WorkSphere Compliance & Audit Engine',
      description: 'Support configurable multi-stage approval chains from Level 1 Team Lead up to Final HR sign-off with audit trail.',
      assignee: {
        id: 'EMP-0142',
        name: 'Rohan Sharma',
        role: 'Full Stack Java Engineer',
        department: 'Platform Services',
        email: 'rohan.sharma@worksphere.io',
        avatarColor: '#f59e0b',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-16',
      dueDate: '2026-10-30',
      status: 'In Progress',
      priority: 'Urgent',
      estimatedHours: 32,
      loggedHours: 16,
      progressPercent: 50,
      category: 'Backend Platform',
      subtasks: ['State machine design', 'Approval chain entity schema', 'Audit log event triggers'],
    },
    {
      sNo: 6,
      id: 'TSK-2006',
      title: 'Deploy Kubernetes Helm Charts & Auto-scaling Ingress Pods',
      project: 'Cloud Infrastructure & Kubernetes',
      description: 'Author production Helm charts with resource requests/limits, Horizontal Pod Autoscaling (HPA), and TLS termination.',
      assignee: {
        id: 'EMP-0171',
        name: 'Sneha Reddy',
        role: 'Cloud & SecOps Specialist',
        department: 'Cybersecurity & IAM',
        email: 'sneha.reddy@worksphere.io',
        avatarColor: '#14b8a6',
      },
      assignedBy: {
        name: 'David Chen',
        employeeId: 'EMP-0112',
        role: 'Infrastructure Lead',
      },
      assignedDate: '2026-10-19',
      dueDate: '2026-11-05',
      status: 'Pending',
      priority: 'Medium',
      estimatedHours: 18,
      loggedHours: 2,
      progressPercent: 10,
      category: 'DevOps & Cloud',
      subtasks: ['Author Helm values schema', 'Configure HPA metric targets', 'Staging deployment rollout'],
    },
    {
      sNo: 7,
      id: 'TSK-2007',
      title: 'Offline Data Sync & Background Geofencing for Mobile App',
      project: 'Employee Self-Service Mobile Application',
      description: 'Implement offline punch-in storage with SQLite and background GPS geofence validation for automated presence marking.',
      assignee: {
        id: 'EMP-0164',
        name: 'Vikram Malhotra',
        role: 'Mobile Applications Developer',
        department: 'Mobile Engineering',
        email: 'vikram.malhotra@worksphere.io',
        avatarColor: '#6366f1',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-17',
      dueDate: '2026-10-29',
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 22,
      loggedHours: 14,
      progressPercent: 60,
      category: 'Mobile Engineering',
      subtasks: ['Local auth plugin integration', 'Offline SQLite storage', 'Sync conflict resolver'],
    },
    {
      sNo: 8,
      id: 'TSK-2008',
      title: 'Audit & Patch Dependencies for Annual SOC2 Security Compliance',
      project: 'WorkSphere Enterprise Core v2.4',
      description: 'Run npm audit, replace vulnerable transitive packages, and verify cryptographic signing on all internal build artifacts.',
      assignee: {
        id: 'EMP-0171',
        name: 'Sneha Reddy',
        role: 'Cloud & SecOps Specialist',
        department: 'Cybersecurity & IAM',
        email: 'sneha.reddy@worksphere.io',
        avatarColor: '#14b8a6',
      },
      assignedBy: {
        name: 'David Chen',
        employeeId: 'EMP-0112',
        role: 'Infrastructure Lead',
      },
      assignedDate: '2026-10-12',
      dueDate: '2026-10-19',
      status: 'Completed',
      priority: 'Low',
      estimatedHours: 10,
      loggedHours: 9.5,
      progressPercent: 100,
      category: 'Security & Compliance',
      subtasks: ['Run vulnerability scanner', 'Update lodash and moment.js', 'Generate audit report'],
    },
  ];

  constructor() {
    this.tasks = [...this.defaultTasks];
    this.availableProjects = [
      'WorkSphere Enterprise Core v2.4',
      'WorkSphere HR Suite',
      'Payroll Automation Engine',
      'Employee Self-Service Mobile Application',
      'Cloud Infrastructure & Kubernetes',
      'Enterprise Single Sign-On (SSO) Gateway',
      'WorkSphere Compliance & Audit Engine',
    ];
    this.refreshTasksFromBackend();
    this.loadTeamAndProjectsMetadata();
  }

  refreshTasks(): void {
    this.refreshTasksFromBackend();
  }

  private loadTeamAndProjectsMetadata(): void {
    const palette = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

    this.http
      .get<{ members?: any[] }>(API_ENDPOINTS.WORKSPACE.TEAM_MEMBERS)
      .pipe(catchError(() => of({ members: [] })))
      .subscribe((res) => {
        if (res?.members && res.members.length > 0) {
          this.teamMembers = res.members.map((m, idx) => ({
            id: m.id,
            name: m.name,
            role: m.role || 'Engineer',
            department: m.department || 'Engineering',
            email: m.email || `${m.name.toLowerCase().replace(/\s+/g, '.')}@worksphere.com`,
            avatarColor: palette[idx % palette.length],
          }));
        }
      });

    this.http
      .get<{ projects?: any[] }>(API_ENDPOINTS.WORKSPACE.PROJECTS)
      .pipe(catchError(() => of({ projects: [] })))
      .subscribe((res) => {
        if (res?.projects && res.projects.length > 0) {
          this.availableProjects = res.projects.map((p) => p.name);
        }
      });
  }

  /**
   * Syncs tasks directly from PostgreSQL (GET /api/tasks).
   */
  refreshTasksFromBackend(assigneeCode?: string, departmentCode?: string): void {
    const params: Record<string, string> = {};
    if (assigneeCode) params['assigneeCode'] = assigneeCode;
    if (departmentCode) params['departmentCode'] = departmentCode;

    const palette = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

    this.http
      .get<{ tasks?: any[] }>(API_ENDPOINTS.TASKS.BASE, { params })
      .pipe(catchError(() => of({ tasks: [] })))
      .subscribe((res) => {
        if (res?.tasks && res.tasks.length > 0) {
          this.tasks = res.tasks.map((t, idx) => ({
            sNo: idx + 1,
            id: t.taskCode || t.id || `TSK-${2001 + idx}`,
            title: t.title,
            project: t.projectName || 'WorkSphere Enterprise Core',
            description: t.description,
            assignee: {
              id: t.assignee?.id || 'EMP-005',
              name: t.assignee?.name || 'Employee',
              role: t.assignee?.role || 'Software Developer',
              department: t.assignee?.department || 'Engineering',
              email: `${(t.assignee?.name || 'employee').toLowerCase().replace(/\s+/g, '.')}@worksphere.com`,
              avatarColor: palette[idx % palette.length],
            },
            assignedBy: {
              name: t.assignedBy?.name || 'Manager',
              employeeId: t.assignedBy?.id || 'EMP-004',
              role: t.assignedBy?.role || 'Team Lead',
            },
            assignedDate: t.assignedDate || new Date().toISOString().split('T')[0],
            dueDate: t.dueDate || new Date().toISOString().split('T')[0],
            status: t.status || 'Pending',
            priority: t.priority || 'Medium',
            estimatedHours: Number(t.estimatedHours || 8),
            loggedHours: Number(t.loggedHours || 0),
            progressPercent: Number(t.progressPercent || 0),
            category: t.category || 'Engineering',
            subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
          }));
        } else {
          this.tasks = [...this.defaultTasks];
        }
        this.tasksSubject.next([...this.tasks]);
      });
  }

  getTasks(): ManagedTask[] {
    return [...this.tasks];
  }

  addTask(taskData: {
    title: string;
    project: string;
    description: string;
    assigneeId: string;
    dueDate: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    estimatedHours: number;
    category?: string;
    subtasks?: string[];
  }): ManagedTask {
    const assignee =
      this.teamMembers.find((m) => m.id === taskData.assigneeId) ||
      this.teamMembers[0] || {
        id: taskData.assigneeId || 'EMP-005',
        name: 'Team Member',
        role: 'Software Developer',
        department: 'Engineering',
        email: 'employee@worksphere.com',
        avatarColor: '#10b981',
      };
    const nextIdNum = 2000 + this.tasks.length + 1;
    const newTask: ManagedTask = {
      sNo: this.tasks.length + 1,
      id: `TSK-${nextIdNum}`,
      title: taskData.title.trim(),
      project: taskData.project,
      description: taskData.description.trim(),
      assignee: assignee,
      assignedBy: {
        name: this.authService.currentUser?.fullName || 'Priya Nair',
        employeeId: this.authService.getCurrentManagerCode(),
        role: this.authService.currentUser?.designationTitle || 'Team Lead & Manager',
      },
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: taskData.dueDate,
      status: 'Pending',
      priority: taskData.priority,
      estimatedHours: Number(taskData.estimatedHours) || 8,
      loggedHours: 0,
      progressPercent: 0,
      category: taskData.category || 'General',
      subtasks:
        taskData.subtasks && taskData.subtasks.length > 0
          ? taskData.subtasks
          : ['Initial requirement analysis'],
    };

    this.tasks.unshift(newTask);
    this.reIndex();

    this.http
      .post<{ task?: any }>(API_ENDPOINTS.TASKS.BASE, {
        title: newTask.title,
        description: newTask.description,
        projectName: newTask.project,
        assigneeEmployeeCode: taskData.assigneeId,
        assignedByEmployeeCode: this.authService.getCurrentManagerCode(),
        dueDate: taskData.dueDate,
        priority: newTask.priority,
        estimatedHours: newTask.estimatedHours,
        category: newTask.category,
        subtasks: newTask.subtasks,
      })
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (res?.task?.taskCode) {
          newTask.id = res.task.taskCode;
        }
      });

    return newTask;
  }

  updateTaskStatus(id: string, newStatus: 'Pending' | 'In Progress' | 'Completed'): void {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.status = newStatus;
      if (newStatus === 'Completed') {
        task.progressPercent = 100;
      } else if (newStatus === 'Pending') {
        task.progressPercent = 0;
      } else if (newStatus === 'In Progress' && task.progressPercent === 0) {
        task.progressPercent = 25;
      }

      this.http
        .patch(API_ENDPOINTS.TASKS.UPDATE_STATUS(id), {
          status: newStatus,
          progressPercent: task.progressPercent,
        })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.reIndex();

    this.http
      .delete(API_ENDPOINTS.TASKS.DELETE(id))
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  resetToDefaults(): void {
    this.refreshTasksFromBackend();
  }

  private reIndex(): void {
    this.tasks.forEach((task, idx) => {
      task.sNo = idx + 1;
    });
  }
}
