import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, TeamMember } from '../../../../core/services/task.service';

export interface TicketTypeOption {
  type: 'Task' | 'Bug' | 'Feature' | 'Improvement' | 'Support';
  label: string;
  icon: string;
  badgeClass: string;
  description: string;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  icon: string;
}

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './create-task.html',
  styleUrl: './create-task.css',
})
export class CreateTask implements OnInit {
  // 1. Classification & Type
  ticketType: 'Task' | 'Bug' | 'Feature' | 'Improvement' | 'Support' = 'Task';
  readonly ticketTypeOptions: TicketTypeOption[] = [
    {
      type: 'Task',
      label: 'Task',
      icon: 'bi-check2-circle',
      badgeClass: 'type-badge-task',
      description: 'Standard team work item or project deliverable',
    },
    {
      type: 'Bug',
      label: 'Bug / Defect',
      icon: 'bi-bug-fill',
      badgeClass: 'type-badge-bug',
      description: 'Report an issue or unexpected system malfunction',
    },
    {
      type: 'Feature',
      label: 'Feature Request',
      icon: 'bi-stars',
      badgeClass: 'type-badge-feature',
      description: 'New product capability or workflow enhancement',
    },
    {
      type: 'Improvement',
      label: 'Improvement',
      icon: 'bi-lightning-charge-fill',
      badgeClass: 'type-badge-improvement',
      description: 'Performance optimization or UI/UX refinement',
    },
    {
      type: 'Support',
      label: 'Internal Support',
      icon: 'bi-life-preserver',
      badgeClass: 'type-badge-support',
      description: 'DevOps, infrastructure, access, or IT service request',
    },
  ];

  // 2. Core Form Model
  taskTitle: string = '';
  selectedProject: string = '';
  selectedAssigneeId: string = '';
  selectedPriority: 'Urgent' | 'High' | 'Medium' | 'Low' = 'Medium';
  dueDate: string = '';
  estimatedHours: number = 16;
  selectedCategory: string = 'Frontend Engineering';
  taskDescription: string = '';

  // 3. Tags & Labels
  tags: string[] = ['Core Platform', 'UI/UX'];
  newTagInput: string = '';
  readonly suggestedTags: string[] = [
    'Frontend',
    'Backend',
    'API Contract',
    'Database',
    'Security',
    'DevOps',
    'High-Impact',
    'Q3-Release',
  ];

  // 4. Checklist / Subtasks
  newSubtaskText: string = '';
  subtasks: string[] = [
    'Review technical specifications & architecture requirements',
    'Develop code implementation and unit test coverage (>80%)',
    'Submit pull request for engineering peer review and CI pass',
  ];

  // 5. Attachments
  attachments: AttachmentItem[] = [
    {
      id: 'att-1',
      name: 'System_Architecture_Spec_v2.pdf',
      size: '1.4 MB',
      type: 'pdf',
      icon: 'bi-file-earmark-pdf-fill text-danger',
    },
  ];

  // 6. Options from Service
  teamMembers: TeamMember[] = [];
  availableProjects: string[] = [];
  categories: string[] = [
    'Frontend Engineering',
    'Backend Services',
    'Database / Platform',
    'UI/UX Design',
    'Quality Assurance',
    'Cloud & DevOps',
    'Security & Compliance',
    'IT & Support',
  ];

  // 7. Submission State
  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  errorMessage: string = '';
  estimatedDaysDisplay: number = 2;

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.teamMembers = this.taskService.teamMembers;
    this.availableProjects = this.taskService.availableProjects;

    // Set sensible defaults
    if (this.teamMembers.length > 0) {
      this.selectedAssigneeId = this.teamMembers[0].id;
    }
    if (this.availableProjects.length > 0) {
      this.selectedProject = this.availableProjects[0];
    }

    // Default due date to 7 days in future
    this.setDueDatePreset(7);
    this.calculateEstimatedDays();
  }

  get selectedAssignee(): TeamMember | undefined {
    return this.teamMembers.find((m) => m.id === this.selectedAssigneeId);
  }

  get currentTypeMeta(): TicketTypeOption {
    return (
      this.ticketTypeOptions.find((o) => o.type === this.ticketType) ||
      this.ticketTypeOptions[0]
    );
  }

  // Type selection
  setTicketType(type: 'Task' | 'Bug' | 'Feature' | 'Improvement' | 'Support'): void {
    this.ticketType = type;
  }

  // Priority selection
  setPriority(p: 'Urgent' | 'High' | 'Medium' | 'Low'): void {
    this.selectedPriority = p;
  }

  // Direct Assignee Selection
  selectAssignee(id: string): void {
    this.selectedAssigneeId = id;
  }

  // Due Date preset buttons
  setDueDatePreset(daysFromNow: number): void {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromNow);
    this.dueDate = targetDate.toISOString().split('T')[0];
  }

  // Hours Change Handler
  onHoursChange(): void {
    if (this.estimatedHours < 1) this.estimatedHours = 1;
    if (this.estimatedHours > 500) this.estimatedHours = 500;
    this.calculateEstimatedDays();
  }

  calculateEstimatedDays(): void {
    this.estimatedDaysDisplay = Math.max(
      1,
      Math.round((this.estimatedHours / 8) * 10) / 10
    );
  }

  // Tags Management
  addTag(tagText: string): void {
    const trimmed = tagText.trim();
    if (trimmed && !this.tags.includes(trimmed)) {
      this.tags.push(trimmed);
    }
    this.newTagInput = '';
  }

  removeTag(tagToRemove: string): void {
    this.tags = this.tags.filter((t) => t !== tagToRemove);
  }

  toggleSuggestedTag(tag: string): void {
    if (this.tags.includes(tag)) {
      this.removeTag(tag);
    } else {
      this.addTag(tag);
    }
  }

  // Subtask management
  addSubtask(): void {
    if (this.newSubtaskText.trim()) {
      this.subtasks.push(this.newSubtaskText.trim());
      this.newSubtaskText = '';
    }
  }

  removeSubtask(index: number): void {
    this.subtasks.splice(index, 1);
  }

  // Description Template Insertions
  insertTemplate(templateType: 'acceptance' | 'steps' | 'technical'): void {
    let snippet = '';
    if (templateType === 'acceptance') {
      snippet = `\n\n### Acceptance Criteria:\n- [ ] Given user is authenticated, when loading page, expect 200 OK\n- [ ] Edge cases handled with helpful user error feedback\n- [ ] Cross-browser verified on Chrome, Firefox, and Safari`;
    } else if (templateType === 'steps') {
      snippet = `\n\n### Steps to Reproduce / Validate:\n1. Navigate to target view\n2. Trigger action with payload\n3. Observe expected response state`;
    } else if (templateType === 'technical') {
      snippet = `\n\n### Technical Scope & Architecture:\n- Impacted Components: \n- Endpoints: \n- Database Schema / Migrations: \n- Performance SLA: < 200ms`;
    }

    this.taskDescription = (this.taskDescription + snippet).trim();
  }

  // Simulated File Upload
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        let icon = 'bi-file-earmark-text text-secondary';
        if (file.name.endsWith('.pdf')) icon = 'bi-file-earmark-pdf-fill text-danger';
        else if (file.name.match(/\.(png|jpg|jpeg|webp)$/i)) icon = 'bi-file-earmark-image-fill text-primary';
        else if (file.name.match(/\.(zip|tar|gz)$/i)) icon = 'bi-file-earmark-zip-fill text-warning';

        this.attachments.push({
          id: `att-${Date.now()}-${i}`,
          name: file.name,
          size: `${sizeInMb} MB`,
          type: file.type || 'file',
          icon: icon,
        });
      }
      input.value = '';
    }
  }

  removeAttachment(id: string): void {
    this.attachments = this.attachments.filter((a) => a.id !== id);
  }

  // Reset form
  resetForm(): void {
    this.taskTitle = '';
    this.taskDescription = '';
    this.selectedPriority = 'Medium';
    this.ticketType = 'Task';
    this.subtasks = [
      'Review technical specifications & requirements',
      'Develop code implementation and test coverage',
      'Submit PR for engineering review',
    ];
    this.tags = ['Core Platform'];
    this.setDueDatePreset(7);
    this.estimatedHours = 16;
    this.calculateEstimatedDays();
    this.errorMessage = '';
  }

  // Form Submit
  onSubmit(): void {
    this.errorMessage = '';

    // Form Validation
    if (!this.taskTitle.trim()) {
      this.errorMessage = 'Please provide a descriptive task/ticket title.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!this.selectedProject) {
      this.errorMessage = 'Please select a target project for this deliverable.';
      return;
    }
    if (!this.selectedAssigneeId) {
      this.errorMessage = 'Please assign this ticket to a team member.';
      return;
    }
    if (!this.dueDate) {
      this.errorMessage = 'Please specify a target completion due date.';
      return;
    }
    if (!this.taskDescription.trim()) {
      this.errorMessage = 'Please provide a scope or description for this ticket.';
      return;
    }

    this.isSubmitting = true;

    // Compose final title with optional type prefix if appropriate
    const formattedTitle =
      this.ticketType !== 'Task'
        ? `[${this.ticketType}] ${this.taskTitle.trim()}`
        : this.taskTitle.trim();

    setTimeout(() => {
      this.taskService.addTask({
        title: formattedTitle,
        project: this.selectedProject,
        description: this.taskDescription,
        assigneeId: this.selectedAssigneeId,
        dueDate: this.dueDate,
        priority: this.selectedPriority,
        estimatedHours: Number(this.estimatedHours) || 8,
        category: this.selectedCategory,
        subtasks: this.subtasks,
      });

      this.isSubmitting = false;
      this.isSuccess = true;

      // Redirect back to task management after 1.2s
      setTimeout(() => {
        this.router.navigate(['/employee/task-management']);
      }, 1200);
    }, 600);
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
}
