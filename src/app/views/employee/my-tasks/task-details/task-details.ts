import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { TaskService, ManagedTask } from '../../../../core/services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  DetailedSubtask,
  DetailedAttachment,
  SubmittedDocument,
  DetailedComment,
  TaskDetailModel
} from '../../../../core/models/task-project-team.interface';
import {
  Badge,
  BadgeVariant,
  Button,
  Toaster,
  ToasterService
} from '../../../../library/UI/components';

export type {
  DetailedSubtask,
  DetailedAttachment,
  SubmittedDocument,
  DetailedComment,
  TaskDetailModel
} from '../../../../core/models/task-project-team.interface';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, Badge, Button, Toaster],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private toaster = inject(ToasterService);

  task: TaskDetailModel | null = null;
  taskId: string = '';
  private sub!: Subscription;

  // New subtask addition by manager
  newSubtaskTitle: string = '';

  // Comment state
  newCommentText: string = '';

  // Document Upload & Submission State
  selectedFileName: string = '';
  selectedFileSize: string = '';
  deliverableNote: string = '';

  // Effort logging
  hoursToLog: number = 2;

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.loadTask(id);
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  loadTask(id: string | null): void {
    const list = this.taskService.getTasks();
    let found = id ? this.taskService.getTaskById(id) : list[0];

    if (!found && list.length > 0) {
      found = list[0];
    }

    if (found) {
      this.applyManagedTask(found);
      return;
    }

    // Fallback: subscribe to tasks$ in case tasks are currently fetching
    const sub = this.taskService.tasks$.subscribe((tasks) => {
      if (tasks && tasks.length > 0) {
        const target = id ? (tasks.find((t) => t.id === id) || tasks[0]) : tasks[0];
        if (target) {
          this.applyManagedTask(target);
        }
        sub.unsubscribe();
      }
    });
  }

  private applyManagedTask(target: ManagedTask): void {
    this.taskId = target.id;
    this.task = {
      id: target.id,
      title: target.title || 'Task Specification',
      project: target.project || 'WorkSphere Enterprise Core',
      category: target.category || 'Platform Engineering',
      description: target.description || '',
      fullDescription:
        target.description +
        '. Review all acceptance criteria, verify automated pipeline runs, and submit code deliverables for managerial approval.',
      assignee: {
        id: target.assignee?.id || 'EMP-0142',
        name: target.assignee?.name || 'Rohan Sharma',
        role: target.assignee?.role || 'Full Stack Java Engineer',
        department: target.assignee?.department || 'Platform Services',
        email: target.assignee?.email || 'rohan.sharma@worksphere.io',
        avatarColor: target.assignee?.avatarColor || '#10b981',
      },
      assignedBy: {
        name: target.assignedBy?.name || 'Sarah Jenkins',
        employeeId: target.assignedBy?.employeeId || 'EMP-0104',
        role: target.assignedBy?.role || 'Engineering Lead & Project Manager',
        department: 'Engineering Leadership',
        email: 'sarah.jenkins@worksphere.io',
      },
      assignedDate: target.assignedDate || '2026-10-18',
      dueDate: target.dueDate || '2026-10-30',
      status: target.status || 'Pending',
      priority: target.priority || 'Medium',
      estimatedHours: Number(target.estimatedHours || 16),
      loggedHours: Number(target.loggedHours || 0),
      progressPercent: Number(
        target.progressPercent ??
          (target.status === 'Completed' ? 100 : target.status === 'In Progress' ? 50 : 0)
      ),
      subtasks: Array.isArray(target.subtasks) && target.subtasks.length > 0
        ? target.subtasks.map((st, idx) => ({
            id: idx + 1,
            title: typeof st === 'string' ? st : (st as any).title,
            completed:
              target.status === 'Completed' ||
              (target.progressPercent >= (idx + 1) * 33),
          }))
        : [
            { id: 1, title: 'Architecture and requirement breakdown', completed: true },
            { id: 2, title: 'Implementation and automated unit testing', completed: target.status === 'Completed' },
            { id: 3, title: 'Code review and deliverable submission', completed: target.status === 'Completed' },
          ],
      attachments: [
        {
          name: `${target.id}_architecture_spec.pdf`,
          size: '1.8 MB',
          type: 'pdf',
          icon: 'bi-file-earmark-pdf-fill text-danger',
        },
        {
          name: 'api_contract_schema.json',
          size: '340 KB',
          type: 'json',
          icon: 'bi-file-earmark-code-fill text-primary',
        },
      ],
      submittedDocuments: [
        {
          id: 1,
          name: `${target.id}_pull_request_verification.md`,
          size: '56 KB',
          uploadedDate: '24 Oct 2026, 11:30 AM',
          uploadedBy: target.assignee?.name || 'Assignee',
          status: target.status === 'Completed' ? 'Accepted' : 'Under Review',
          note: 'PR merge checklist and initial stress testing results attached for manager review.',
        },
      ],
      comments: [
        {
          id: 1,
          author: target.assignedBy?.name || 'Sarah Jenkins',
          role: 'Manager / Team Lead',
          date: '20 Oct 2026, 09:15 AM',
          message:
            'Please ensure the test suite covers failure edge cases and p99 response timings before opening the final PR.',
          isManager: true,
        },
        {
          id: 2,
          author: target.assignee?.name || 'Rohan Sharma',
          role: target.assignee?.role || 'Assignee',
          date: '22 Oct 2026, 02:40 PM',
          message:
            'Benchmarked the initial batch and verified latency contracts. Code is on track for delivery ahead of the due date.',
          isManager: false,
        },
      ],
    };
  }

  // Update Status
  updateStatus(newStatus: 'Pending' | 'In Progress' | 'Completed'): void {
    if (!this.task) return;
    this.task.status = newStatus;
    if (newStatus === 'Completed') {
      this.task.progressPercent = 100;
      this.task.subtasks.forEach((s) => (s.completed = true));
    } else if (newStatus === 'Pending') {
      this.task.progressPercent = 0;
      this.task.subtasks.forEach((s) => (s.completed = false));
    } else if (newStatus === 'In Progress' && this.task.progressPercent === 0) {
      this.task.progressPercent = 35;
    }
    this.taskService.updateTaskStatus(this.task.id, newStatus);
    this.toaster.show({
      title: 'Status Updated',
      message: `Task status changed to "${newStatus}"`,
      variant: 'success',
      icon: 'bi-check-circle-fill',
    });
  }

  // Check off existing assigned subtasks
  toggleSubtask(subtaskId: number): void {
    if (!this.task) return;
    const item = this.task.subtasks.find((s) => s.id === subtaskId);
    if (item) {
      item.completed = !item.completed;
      const done = this.task.subtasks.filter((s) => s.completed).length;
      this.task.progressPercent = Math.round((done / this.task.subtasks.length) * 100);
      if (this.task.progressPercent === 100) {
        this.task.status = 'Completed';
        this.taskService.updateTaskStatus(this.task.id, 'Completed');
      } else if (this.task.progressPercent > 0 && this.task.status === 'Pending') {
        this.task.status = 'In Progress';
        this.taskService.updateTaskStatus(this.task.id, 'In Progress');
      }
      this.toaster.show({
        title: 'Checklist Updated',
        message: `Action item "${item.title}" status updated.`,
        variant: 'info',
        icon: 'bi-check2-square',
      });
    }
  }

  // Add new subtask (Manager capability)
  addSubtask(): void {
    if (!this.task || !this.newSubtaskTitle.trim()) return;
    const newId = this.task.subtasks.length > 0
      ? Math.max(...this.task.subtasks.map((s) => s.id)) + 1
      : 1;

    this.task.subtasks.push({
      id: newId,
      title: this.newSubtaskTitle.trim(),
      completed: false,
    });

    const done = this.task.subtasks.filter((s) => s.completed).length;
    this.task.progressPercent = Math.round((done / this.task.subtasks.length) * 100);
    this.newSubtaskTitle = '';

    this.toaster.show({
      title: 'Subtask Added',
      message: 'New deliverable item assigned to the checklist.',
      variant: 'success',
      icon: 'bi-plus-circle',
    });
  }

  // Remove a subtask
  deleteSubtask(subtaskId: number): void {
    if (!this.task) return;
    this.task.subtasks = this.task.subtasks.filter((s) => s.id !== subtaskId);
    if (this.task.subtasks.length > 0) {
      const done = this.task.subtasks.filter((s) => s.completed).length;
      this.task.progressPercent = Math.round((done / this.task.subtasks.length) * 100);
    }
    this.toaster.show({
      title: 'Item Removed',
      message: 'Checklist item removed.',
      variant: 'warning',
      icon: 'bi-trash',
    });
  }

  // File Selection Handler for Document Submission
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFileName = file.name;
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      this.selectedFileSize = file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.round(file.size / 1024)} KB`;
    }
  }

  // Submit Work Document / Deliverable
  submitDocument(): void {
    if (!this.task) return;
    if (!this.selectedFileName) {
      this.toaster.show({
        title: 'File Required',
        message: 'Please choose a deliverable file first.',
        variant: 'warning',
        icon: 'bi-exclamation-triangle',
      });
      return;
    }

    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newDoc: SubmittedDocument = {
      id: Date.now(),
      name: this.selectedFileName,
      size: this.selectedFileSize || '1.2 MB',
      uploadedDate: formattedDate,
      uploadedBy: this.authService.currentUser?.fullName || 'Manager',
      status: 'Submitted',
      note: this.deliverableNote.trim() || 'Work deliverable uploaded for evaluation.',
    };

    if (!this.task.submittedDocuments) {
      this.task.submittedDocuments = [];
    }
    this.task.submittedDocuments.unshift(newDoc);

    if (this.task.status === 'Pending') {
      this.task.status = 'In Progress';
      this.taskService.updateTaskStatus(this.task.id, 'In Progress');
    }

    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.deliverableNote = '';

    this.toaster.show({
      title: 'Deliverable Uploaded',
      message: 'Deliverable document submitted successfully.',
      variant: 'success',
      icon: 'bi-cloud-check',
    });
  }

  // Update Deliverable Status (Manager approval)
  updateDocumentStatus(docId: number, newStatus: 'Submitted' | 'Under Review' | 'Accepted'): void {
    if (!this.task || !this.task.submittedDocuments) return;
    const doc = this.task.submittedDocuments.find((d) => d.id === docId);
    if (doc) {
      doc.status = newStatus;
      this.toaster.show({
        title: 'Deliverable Reviewed',
        message: `Deliverable marked as "${newStatus}".`,
        variant: newStatus === 'Accepted' ? 'success' : 'info',
        icon: 'bi-shield-check',
      });
    }
  }

  // Remove a submitted document
  removeSubmittedDocument(docId: number): void {
    if (!this.task || !this.task.submittedDocuments) return;
    this.task.submittedDocuments = this.task.submittedDocuments.filter((d) => d.id !== docId);
    this.toaster.show({
      title: 'Document Removed',
      message: 'Submitted document removed.',
      variant: 'warning',
      icon: 'bi-trash',
    });
  }

  // Post Discussion / Progress Comment
  submitComment(): void {
    if (!this.task || !this.newCommentText.trim()) return;
    const comment: DetailedComment = {
      id: Date.now(),
      author: this.authService.currentUser?.fullName || 'Sarah Jenkins',
      role: this.authService.currentUser?.designationTitle || 'Engineering Lead & Project Manager',
      date: 'Just now',
      message: this.newCommentText.trim(),
      isManager: true,
    };
    this.task.comments.push(comment);
    this.newCommentText = '';
    this.toaster.show({
      title: 'Comment Posted',
      message: 'Progress update added to the collaboration thread.',
      variant: 'success',
      icon: 'bi-chat-dots-fill',
    });
  }

  // Log Effort Hours
  logWorkHours(): void {
    if (!this.task || this.hoursToLog <= 0) return;
    this.task.loggedHours = +(this.task.loggedHours + this.hoursToLog).toFixed(1);
    this.toaster.show({
      title: 'Effort Logged',
      message: `Logged +${this.hoursToLog}h on this task. Total: ${this.task.loggedHours}h`,
      variant: 'success',
      icon: 'bi-stopwatch-fill',
    });
  }

  // Delete Task
  deleteTask(): void {
    if (!this.task) return;
    if (confirm(`Are you sure you want to delete task "${this.task.id}: ${this.task.title}"?`)) {
      this.taskService.deleteTask(this.task.id);
      this.toaster.show({
        title: 'Task Deleted',
        message: `Task ${this.task.id} has been deleted. Returning to Directory...`,
        variant: 'danger',
        icon: 'bi-trash',
      });
      setTimeout(() => {
        this.router.navigate(['/employee/task-management']);
      }, 1000);
    }
  }

  get completedSubtasksCount(): number {
    return this.task?.subtasks.filter((s) => s.completed).length || 0;
  }

  get totalSubtasksCount(): number {
    return this.task?.subtasks.length || 0;
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Completed':
        return 'soft-emerald';
      case 'In Progress':
        return 'soft-info';
      case 'Pending':
        return 'soft-warning';
      default:
        return 'light';
    }
  }

  getPriorityBadgeVariant(priority?: string): BadgeVariant {
    switch (priority) {
      case 'Urgent':
        return 'soft-danger';
      case 'High':
        return 'soft-warning';
      case 'Medium':
        return 'soft-info';
      case 'Low':
        return 'light';
      default:
        return 'light';
    }
  }
}
