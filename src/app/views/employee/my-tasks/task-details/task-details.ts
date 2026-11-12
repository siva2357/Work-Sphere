import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { TaskService } from '../../../../core/services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  DetailedSubtask,
  DetailedAttachment,
  SubmittedDocument,
  DetailedComment,
  TaskDetailModel
} from '../../../../core/models/task-project-team.interface';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';

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
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails implements OnInit, OnDestroy {
  task: TaskDetailModel | null = null;
  taskId: string = '';
  private sub!: Subscription;

  // Comment state
  newCommentText: string = '';

  // Document Upload & Submission State
  selectedFileName: string = '';
  selectedFileSize: string = '';
  deliverableNote: string = '';
  isUploading: boolean = false;

  // Effort logging
  hoursToLog: number = 2;

  // Toast alert
  toastMessage: string = '';
  private toastTimer: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private taskService: TaskService,
    private authService: AuthService
  ) { }

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
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  loadTask(id: string | null): void {
    this.http.get<any[]>(API_ENDPOINTS.TASKS.BASE).subscribe({
      next: (rows) => {
        const list = rows || [];
        const found = id ? list.find((t) => t.id === id) : list[0];
        const target = found || list[0];
        if (target) {
          this.taskId = target.id;
          this.task = {
            id: target.id,
            title: target.title || 'Task Detail',
            project: target.project || 'WorkSphere Enterprise',
            description: target.description || '',
            fullDescription: target.fullDescription || target.description || '',
            assignedBy: {
              name: target.assignedByName || target.assignedBy?.name || 'Department Lead',
              employeeId: target.assignedById || target.assignedBy?.employeeId || 'EMP-100',
              role: target.assignedByRole || target.assignedBy?.role || 'Manager',
              department: target.department || target.assignedBy?.department || 'Engineering',
              email: target.assignedByEmail || target.assignedBy?.email || ''
            },
            assignedDate: target.assignedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            dueDate: target.dueDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: (target.status || 'Pending') as TaskDetailModel['status'],
            priority: (target.priority || 'Medium') as TaskDetailModel['priority'],
            estimatedHours: Number(target.estimatedHours ?? 8),
            loggedHours: Number(target.loggedHours ?? 0),
            progressPercent: Number(target.progressPercent ?? (target.status === 'Completed' ? 100 : target.status === 'In Progress' ? 50 : 0)),
            subtasks: Array.isArray(target.subtasks) ? target.subtasks : [],
            attachments: Array.isArray(target.attachments) ? target.attachments : [],
            submittedDocuments: Array.isArray(target.submittedDocuments) ? target.submittedDocuments : [],
            comments: Array.isArray(target.comments) ? target.comments : []
          };
        }
      },
      error: () => {
        this.task = null;
      }
    });
  }

  // Update Status by Employee
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
      this.task.progressPercent = 25;
    }
    this.taskService.updateTaskStatus(this.task.id, newStatus);
    this.showToast(`Task status updated to "${newStatus}"`);
  }

  // Employee can only check off existing assigned subtasks
  toggleSubtask(subtaskId: number): void {
    if (!this.task) return;
    const item = this.task.subtasks.find((s) => s.id === subtaskId);
    if (item) {
      item.completed = !item.completed;
      const done = this.task.subtasks.filter((s) => s.completed).length;
      this.task.progressPercent = Math.round((done / this.task.subtasks.length) * 100);
      if (this.task.progressPercent === 100) {
        this.task.status = 'Completed';
      } else if (this.task.progressPercent > 0 && this.task.status === 'Pending') {
        this.task.status = 'In Progress';
      }
      this.showToast(`Checklist item status updated.`);
    }
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
      this.showToast('Please select a file to upload first.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newDoc: SubmittedDocument = {
      id: Date.now(),
      name: this.selectedFileName,
      size: this.selectedFileSize || '1.2 MB',
      uploadedDate: formattedDate,
      uploadedBy: 'John Doe (You)',
      status: 'Submitted',
      note: this.deliverableNote.trim() || 'Work deliverable uploaded for manager review.'
    };

    if (!this.task.submittedDocuments) {
      this.task.submittedDocuments = [];
    }
    this.task.submittedDocuments.unshift(newDoc);

    // If status was Pending, automatically move to In Progress or Completed
    if (this.task.status === 'Pending') {
      this.task.status = 'In Progress';
    }

    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.deliverableNote = '';
    this.showToast('Deliverable document submitted successfully!');
  }

  // Remove a submitted document
  removeSubmittedDocument(docId: number): void {
    if (!this.task || !this.task.submittedDocuments) return;
    this.task.submittedDocuments = this.task.submittedDocuments.filter((d) => d.id !== docId);
    this.showToast('Submitted document removed.');
  }

  // Post Discussion / Progress Comment
  submitComment(): void {
    if (!this.task || !this.newCommentText.trim()) return;
    const comment: DetailedComment = {
      id: Date.now(),
      author: 'John Doe',
      role: 'Full Stack Engineer (You)',
      date: 'Just now',
      message: this.newCommentText.trim(),
      isManager: false
    };
    this.task.comments.push(comment);
    this.newCommentText = '';
    this.showToast('Your comment has been posted.');
  }

  // Log Effort Hours
  logWorkHours(): void {
    if (!this.task || this.hoursToLog <= 0) return;
    this.task.loggedHours = +(this.task.loggedHours + this.hoursToLog).toFixed(1);
    this.showToast(`Logged ${this.hoursToLog}h of effort on this task.`);
  }

  showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }

  get completedSubtasksCount(): number {
    return this.task?.subtasks.filter((s) => s.completed).length || 0;
  }

  get totalSubtasksCount(): number {
    return this.task?.subtasks.length || 0;
  }

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
}
