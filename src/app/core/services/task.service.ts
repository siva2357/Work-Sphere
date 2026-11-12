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

  constructor() {
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
        if (res?.members) {
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
        if (res?.projects) {
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
        if (res?.tasks) {
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
          this.tasksSubject.next([...this.tasks]);
        }
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
