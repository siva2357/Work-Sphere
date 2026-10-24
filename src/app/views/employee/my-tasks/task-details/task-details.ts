import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface DetailedSubtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface DetailedAttachment {
  name: string;
  size: string;
  type: string;
  icon: string;
}

export interface SubmittedDocument {
  id: number;
  name: string;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
  status: 'Submitted' | 'Under Review' | 'Accepted';
  note?: string;
}

export interface DetailedComment {
  id: number;
  author: string;
  role: string;
  date: string;
  message: string;
  isManager: boolean;
}

export interface TaskDetailModel {
  id: string;
  title: string;
  project: string;
  description: string;
  fullDescription: string;
  assignedBy: {
    name: string;
    employeeId: string;
    role: string;
    department: string;
    email: string;
  };
  assignedDate: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  loggedHours: number;
  progressPercent: number;
  subtasks: DetailedSubtask[];
  attachments: DetailedAttachment[];
  submittedDocuments: SubmittedDocument[];
  comments: DetailedComment[];
}

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

  // Hardcoded detailed tasks stored directly inside the ts file
  private allTaskDetails: TaskDetailModel[] = [
    {
      id: 'TSK-1041',
      title: 'Implement OAuth2 Social Authentication & Session Invalidation',
      project: 'WorkSphere Core v2.4',
      description: 'Integrate Google and Microsoft 365 OAuth2 single sign-on flows with secure session invalidation and token refresh mechanism.',
      fullDescription: 'Configure OpenID Connect authentication providers for Google Workspace and Microsoft Azure AD. Ensure that tokens are securely stored in HttpOnly cookies, handle CSRF protection with state verification, and implement automatic session invalidation upon user logout or inactivity timeout.',
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
        department: 'Core Architecture',
        email: 'sarah.jenkins@worksphere.io'
      },
      assignedDate: '18 Oct 2026',
      dueDate: '28 Oct 2026',
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 28,
      loggedHours: 18.5,
      progressPercent: 65,
      subtasks: [
        { id: 1, title: 'Register OAuth2 apps in Google Cloud & Azure Portals', completed: true },
        { id: 2, title: 'Build Angular auth guard and redirect interceptor', completed: true },
        { id: 3, title: 'Setup token rotation and RefreshToken rotation endpoint', completed: true },
        { id: 4, title: 'Write integration test suites for session expiry', completed: false },
        { id: 5, title: 'Verify cross-browser cookie persistence on Safari & Firefox', completed: false }
      ],
      attachments: [
        { name: 'OAuth2_Architecture_Specification_v1.pdf', size: '2.4 MB', type: 'pdf', icon: 'bi-file-earmark-pdf text-danger' },
        { name: 'Auth_Flow_Wireframes.fig', size: '14.8 MB', type: 'figma', icon: 'bi-file-earmark-code text-primary' }
      ],
      submittedDocuments: [
        {
          id: 101,
          name: 'OAuth2_AuthGuard_Implementation_v1.zip',
          size: '3.8 MB',
          uploadedDate: '21 Oct 2026, 04:30 PM',
          uploadedBy: 'John Doe (EMP-0210)',
          status: 'Submitted',
          note: 'Initial patch containing Angular guard, interceptor, and unit test assertions.'
        }
      ],
      comments: [
        {
          id: 1,
          author: 'Sarah Jenkins',
          role: 'Engineering Lead (Manager)',
          date: '18 Oct 2026, 10:15 AM',
          message: 'Hi John, please prioritize the token rotation logic before Friday so QA can begin pen-testing the auth flow.',
          isManager: true
        },
        {
          id: 2,
          author: 'John Doe',
          role: 'Full Stack Engineer (You)',
          date: '20 Oct 2026, 03:40 PM',
          message: 'Google and Azure providers are integrated and passing mock assertions. Starting work on token refresh tests today.',
          isManager: false
        }
      ]
    },
    {
      id: 'TSK-1042',
      title: 'Optimize Employee Leave Balance Aggregation Query',
      project: 'WorkSphere HR Suite',
      description: 'Refactor SQL database index strategy and query builder for employee attendance and monthly leave calculation.',
      fullDescription: 'The current leave balance calculation takes over 420ms for enterprise tenants with 1,000+ staff members. Refactor the PostgreSQL query to use composite indexes on (tenant_id, employee_id, leave_year) and cache intermediate monthly totals in Redis.',
      assignedBy: {
        name: 'David Chen',
        employeeId: 'EMP-0112',
        role: 'Database & Infrastructure Lead',
        department: 'Data Platform',
        email: 'david.chen@worksphere.io'
      },
      assignedDate: '19 Oct 2026',
      dueDate: '25 Oct 2026',
      status: 'Pending',
      priority: 'Urgent',
      estimatedHours: 16,
      loggedHours: 0,
      progressPercent: 0,
      subtasks: [
        { id: 1, title: 'Analyze slow query logs with EXPLAIN ANALYZE', completed: false },
        { id: 2, title: 'Create DB migration for composite indexes', completed: false },
        { id: 3, title: 'Implement Redis TTL caching layer for monthly balances', completed: false },
        { id: 4, title: 'Benchmark load response time under 100 concurrent requests', completed: false }
      ],
      attachments: [
        { name: 'Query_Flamegraph_Report.pdf', size: '1.8 MB', type: 'pdf', icon: 'bi-file-earmark-pdf text-danger' }
      ],
      submittedDocuments: [],
      comments: [
        {
          id: 1,
          author: 'David Chen',
          role: 'Database Lead (Manager)',
          date: '19 Oct 2026, 11:30 AM',
          message: 'Please coordinate with DevOps before applying the migration script to staging.',
          isManager: true
        }
      ]
    },
    {
      id: 'TSK-1043',
      title: 'Design & Code Responsive Payslip PDF Generator',
      project: 'Payroll Automation Engine',
      description: 'Develop dynamic PDF rendering template with employee deductions, gross pay, tax deductions, and company seal.',
      fullDescription: 'Create clean, compliant PDF payslip layout rendered with headless Chrome / PDFMake. Must support multi-currency, tax breakdown line items, and dynamic company logo watermarking.',
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
        department: 'Core Architecture',
        email: 'sarah.jenkins@worksphere.io'
      },
      assignedDate: '15 Oct 2026',
      dueDate: '22 Oct 2026',
      status: 'Completed',
      priority: 'High',
      estimatedHours: 20,
      loggedHours: 19.5,
      progressPercent: 100,
      subtasks: [
        { id: 1, title: 'Draft PDF HTML/CSS template matching WorkSphere brand', completed: true },
        { id: 2, title: 'Hook up dynamic earnings and deductions data feed', completed: true },
        { id: 3, title: 'Add digital signature watermark verification', completed: true },
        { id: 4, title: 'Test download and email delivery dispatch queue', completed: true }
      ],
      attachments: [
        { name: 'Sample_Payslip_Approved_v3.pdf', size: '940 KB', type: 'pdf', icon: 'bi-file-earmark-pdf text-danger' }
      ],
      submittedDocuments: [
        {
          id: 102,
          name: 'Payslip_PDF_Generator_Bundle.zip',
          size: '4.2 MB',
          uploadedDate: '22 Oct 2026, 02:15 PM',
          uploadedBy: 'John Doe (EMP-0210)',
          status: 'Accepted',
          note: 'Production build of PDF renderer with verified digital watermark.'
        }
      ],
      comments: [
        {
          id: 1,
          author: 'Sarah Jenkins',
          role: 'Engineering Lead (Manager)',
          date: '22 Oct 2026, 04:10 PM',
          message: 'Great work! The finance department approved the template formatting without revisions.',
          isManager: true
        }
      ]
    }
  ];

  constructor(private route: ActivatedRoute) {}

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
    if (id) {
      const found = this.allTaskDetails.find((t) => t.id === id);
      if (found) {
        this.task = found;
        this.taskId = found.id;
        return;
      }
    }
    // Fallback to first task
    this.task = this.allTaskDetails[0];
    this.taskId = this.task.id;
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
