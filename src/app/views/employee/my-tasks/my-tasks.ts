import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { TaskService } from '../../../core/services/task.service';
import { AssignedTask } from '../../../core/models/task-project-team.interface';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';

export type { AssignedTask } from '../../../core/models/task-project-team.interface';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasks implements OnInit {
  // Search & Filter State
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedPriority: string = 'ALL';
  selectedSort: 'dueDateAsc' | 'dueDateDesc' | 'priority' | 'recentlyAssigned' = 'dueDateAsc';

  // Notification Toast
  actionToastMessage: string = '';
  private toastTimer: any;

  // Real-time Tasks Data from Backend Database
  tasksList: AssignedTask[] = [];

  constructor(
    private http: HttpClient,
    private taskService: TaskService
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.http.get<any[]>(API_ENDPOINTS.TASKS.BASE).subscribe({
      next: (rows) => {
        this.tasksList = (rows || []).map((t, idx) => ({
          sNo: idx + 1,
          id: t.id || `TSK-${1040 + idx + 1}`,
          title: t.title || 'Task',
          project: t.project || 'WorkSphere Enterprise',
          description: t.description || '',
          assignedBy: {
            name: t.assignedByName || t.assignedBy?.name || 'Department Lead',
            employeeId: t.assignedById || t.assignedBy?.employeeId || 'EMP-100',
            role: t.assignedByRole || t.assignedBy?.role || 'Manager',
            department: t.department || t.assignedBy?.department || 'Engineering',
            email: t.assignedByEmail || t.assignedBy?.email || ''
          },
          assignedDate: t.assignedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          dueDate: t.dueDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: (t.status || 'Pending') as AssignedTask['status'],
          priority: (t.priority || 'Medium') as AssignedTask['priority'],
          estimatedHours: Number(t.estimatedHours ?? 8),
          loggedHours: Number(t.loggedHours ?? 0),
          progressPercent: Number(t.progressPercent ?? (t.status === 'Completed' ? 100 : t.status === 'In Progress' ? 50 : 0)),
          subtasksCount: Number(t.subtasksCount ?? 4),
          completedSubtasksCount: Number(t.completedSubtasksCount ?? (t.status === 'Completed' ? 4 : t.status === 'In Progress' ? 2 : 0))
        }));
      },
      error: () => {
        this.tasksList = [];
      }
    });
  }

  // --- Statistics Computed Properties ---
  get totalAssignedCount(): number {
    return this.tasksList.length;
  }

  get pendingCount(): number {
    return this.tasksList.filter((t) => t.status === 'Pending').length;
  }

  get inProgressCount(): number {
    return this.tasksList.filter((t) => t.status === 'In Progress').length;
  }

  get completedCount(): number {
    return this.tasksList.filter((t) => t.status === 'Completed').length;
  }

  // --- Filtered and Sorted Tasks ---
  get filteredTasks(): AssignedTask[] {
    let result = [...this.tasksList];

    // Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((t) => t.status === this.selectedStatus);
    }

    // Priority Filter
    if (this.selectedPriority !== 'ALL') {
      result = result.filter((t) => t.priority === this.selectedPriority);
    }

    // Search Query Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          t.assignedBy.name.toLowerCase().includes(q) ||
          t.assignedBy.employeeId.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (this.selectedSort === 'priority') {
        const priorityOrder: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      } else if (this.selectedSort === 'recentlyAssigned') {
        return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
      } else if (this.selectedSort === 'dueDateDesc') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else {
        // dueDateAsc (Default)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

    return result;
  }

  // Quick Status Transition from Table
  changeTaskStatus(task: AssignedTask, newStatus: 'Pending' | 'In Progress' | 'Completed', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    task.status = newStatus;
    if (newStatus === 'Completed') {
      task.progressPercent = 100;
      task.completedSubtasksCount = task.subtasksCount;
    } else if (newStatus === 'Pending') {
      task.progressPercent = 0;
      task.completedSubtasksCount = 0;
    } else if (newStatus === 'In Progress' && task.progressPercent === 0) {
      task.progressPercent = 25;
    }
    this.taskService.updateTaskStatus(task.id, newStatus);
    this.showToast(`Task ${task.id} updated to "${newStatus}"`);
  }

  setStatusFilter(status: string): void {
    this.selectedStatus = status;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedSort = 'dueDateAsc';
  }

  showToast(msg: string): void {
    this.actionToastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.actionToastMessage = '';
    }, 3500);
  }

  // Priority styling helper
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Urgent':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'High':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Medium':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'Low':
        return 'bg-light text-secondary border border-light-subtle';
      default:
        return 'bg-light text-dark';
    }
  }

  // Status styling helper
  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'In Progress':
        return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      case 'Pending':
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      default:
        return 'bg-light text-dark';
    }
  }

  // Subtask completion ratio text
  getSubtaskProgress(task: AssignedTask): string {
    return `${task.completedSubtasksCount}/${task.subtasksCount}`;
  }
}
