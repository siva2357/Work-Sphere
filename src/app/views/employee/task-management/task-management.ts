import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, ManagedTask } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './task-management.html',
  styleUrl: './task-management.css',
})
export class TaskManagement implements OnInit {
  // Search & Filter State
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedPriority: string = 'ALL';
  selectedProject: string = 'ALL';
  selectedSort: 'dueDateAsc' | 'dueDateDesc' | 'priority' | 'recentlyAssigned' = 'dueDateAsc';

  // Notification Toast
  actionToastMessage: string = '';
  private toastTimer: any;

  // Tasks from TaskService
  tasksList: ManagedTask[] = [];
  availableProjects: string[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.refreshTasks();
    this.availableProjects = this.taskService.availableProjects;
  }

  refreshTasks(): void {
    this.tasksList = this.taskService.getTasks();
  }

  // --- Statistics Computed Properties ---
  get totalTasksCount(): number {
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
  get filteredTasks(): ManagedTask[] {
    let result = [...this.tasksList];

    // Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((t) => t.status === this.selectedStatus);
    }

    // Priority Filter
    if (this.selectedPriority !== 'ALL') {
      result = result.filter((t) => t.priority === this.selectedPriority);
    }

    // Project Filter
    if (this.selectedProject !== 'ALL') {
      result = result.filter((t) => t.project === this.selectedProject);
    }

    // Search Query Filter (Title, ID, Description, Project, Assignee name or ID)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          t.assignee.name.toLowerCase().includes(q) ||
          t.assignee.id.toLowerCase().includes(q) ||
          t.assignee.role.toLowerCase().includes(q) ||
          t.assignedBy.name.toLowerCase().includes(q)
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

  // Quick Status Transition from Table Dropdown
  changeTaskStatus(task: ManagedTask, newStatus: 'Pending' | 'In Progress' | 'Completed', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.taskService.updateTaskStatus(task.id, newStatus);
    this.refreshTasks();
    this.showToast(`Task ${task.id} updated to "${newStatus}"`);
  }

  // Delete Task
  deleteTask(task: ManagedTask, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const confirmDelete = window.confirm(`Are you sure you want to remove task "${task.title}" (${task.id})?`);
    if (confirmDelete) {
      this.taskService.deleteTask(task.id);
      this.refreshTasks();
      this.showToast(`Task ${task.id} removed successfully`);
    }
  }

  setStatusFilter(status: string): void {
    this.selectedStatus = status;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedProject = 'ALL';
    this.selectedSort = 'dueDateAsc';
    this.refreshTasks();
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

  getInitials(name: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
}
