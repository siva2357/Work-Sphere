import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProjectService, ProjectMember } from '../../../../core/services/project.service';

export interface MethodologyOption {
  type: 'Agile Scrum' | 'Kanban' | 'Waterfall' | 'Milestone';
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-project.html',
  styleUrl: './create-project.css',
})
export class CreateProject implements OnInit {
  // 1. Methodology Options
  methodology: 'Agile Scrum' | 'Kanban' | 'Waterfall' | 'Milestone' = 'Agile Scrum';
  readonly methodologyOptions: MethodologyOption[] = [
    {
      type: 'Agile Scrum',
      label: 'Agile Scrum',
      icon: 'bi-repeat',
      description: 'Bi-weekly sprints, backlog grooming, and burndown delivery',
    },
    {
      type: 'Kanban',
      label: 'Kanban Flow',
      icon: 'bi-kanban',
      description: 'Continuous delivery workflow with strict Work-In-Progress (WIP) limits',
    },
    {
      type: 'Waterfall',
      label: 'Waterfall Stage',
      icon: 'bi-diagram-3',
      description: 'Sequential phases with architecture gates and signoffs',
    },
    {
      type: 'Milestone',
      label: 'Milestone Driven',
      icon: 'bi-flag-fill',
      description: 'Objective and Key Result (OKR) milestone deliverable focus',
    },
  ];

  // 2. Form Model
  projectTitle: string = '';
  selectedDepartment: string = 'Information Technology';
  selectedCategory: string = 'Core Web Platform';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low' = 'High';
  selectedLeadId: string = '';
  selectedTeamMemberIds: string[] = [];
  startDate: string = '';
  endDate: string = '';
  budget: string = '75000';
  description: string = '';
  externalToolUrl: string = 'https://habit-tracker-lake-zeta.vercel.app/login';

  // 3. Milestones
  milestones: string[] = [
    'System Architecture RFC & Technology Stack Signoff',
    'Core Database Schema & API Contract Implementation',
    'Alpha MVP Release & Security Penetration Testing',
  ];
  newMilestoneText: string = '';

  // 4. Tags
  tags: string[] = ['Strategic', 'Q3-Release', 'Cloud-Native'];
  newTagInput: string = '';
  readonly suggestedTags: string[] = ['Strategic', 'Q3-Release', 'Cloud-Native', 'High-Impact', 'Compliance', 'Microservices'];

  // 5. Options from Service
  departments: string[] = [];
  categories: string[] = [];
  teamMembers: ProjectMember[] = [];

  // 6. Submission State
  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  errorMessage: string = '';
  calculatedDurationMonths: number = 6;

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.departments = this.projectService.availableDepartments;
    this.categories = this.projectService.availableCategories;
    this.teamMembers = this.projectService.teamMembersList;

    // Set defaults
    if (this.teamMembers.length > 0) {
      this.selectedLeadId = this.teamMembers[0].id;
      this.selectedTeamMemberIds = [this.teamMembers[0].id, this.teamMembers[1]?.id || ''];
    }

    // Default dates: Today to 6 months in future
    const now = new Date();
    this.startDate = now.toISOString().split('T')[0];
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    this.endDate = future.toISOString().split('T')[0];
    this.updateDuration();
  }

  get selectedLead(): ProjectMember | undefined {
    return this.teamMembers.find((m) => m.id === this.selectedLeadId);
  }

  get allocatedMembers(): ProjectMember[] {
    return this.teamMembers.filter((m) => this.selectedTeamMemberIds.includes(m.id));
  }

  // Methodology selection
  setMethodology(m: 'Agile Scrum' | 'Kanban' | 'Waterfall' | 'Milestone'): void {
    this.methodology = m;
  }

  // Priority selection
  setPriority(p: 'Urgent' | 'High' | 'Medium' | 'Low'): void {
    this.priority = p;
  }

  // Team Member Toggle
  toggleTeamMember(id: string): void {
    if (this.selectedTeamMemberIds.includes(id)) {
      this.selectedTeamMemberIds = this.selectedTeamMemberIds.filter((mId) => mId !== id);
    } else {
      this.selectedTeamMemberIds.push(id);
    }
  }

  // Date Change Handler
  onDateChange(): void {
    this.updateDuration();
  }

  updateDuration(): void {
    if (this.startDate && this.endDate) {
      const s = new Date(this.startDate).getTime();
      const e = new Date(this.endDate).getTime();
      const diffMonths = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24 * 30)));
      this.calculatedDurationMonths = diffMonths;
    }
  }

  // Milestones management
  addMilestone(): void {
    if (this.newMilestoneText.trim()) {
      this.milestones.push(this.newMilestoneText.trim());
      this.newMilestoneText = '';
    }
  }

  removeMilestone(index: number): void {
    this.milestones.splice(index, 1);
  }

  // Tags management
  addTag(tag: string): void {
    const trimmed = tag.trim();
    if (trimmed && !this.tags.includes(trimmed)) {
      this.tags.push(trimmed);
    }
    this.newTagInput = '';
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  toggleSuggestedTag(tag: string): void {
    if (this.tags.includes(tag)) this.removeTag(tag);
    else this.addTag(tag);
  }

  // Templates
  insertTemplate(type: 'scope' | 'architecture' | 'goals'): void {
    let snippet = '';
    if (type === 'scope') {
      snippet = `\n\n### Project Scope & Objectives:\n- Primary Objective: \n- Target Stakeholders: \n- Success Metrics & Deliverables: `;
    } else if (type === 'architecture') {
      snippet = `\n\n### Technical Architecture:\n- Tech Stack: Angular 17, Java Spring Boot, PostgreSQL, AWS\n- Scalability Target: 10,000 Concurrent Users\n- SLA Availability: 99.9% Uptime`;
    } else if (type === 'goals') {
      snippet = `\n\n### Key Deliverables & OKRs:\n- Q1: Architecture RFC signoff & data model definition\n- Q2: Core microservices implementation & frontend components\n- Q3: Automated CI/CD pipeline & staging deployment`;
    }
    this.description = (this.description + snippet).trim();
  }

  // Reset
  resetForm(): void {
    this.projectTitle = '';
    this.description = '';
    this.priority = 'High';
    this.methodology = 'Agile Scrum';
    this.budget = '75000';
    this.milestones = [
      'System Architecture RFC & Tech Stack Signoff',
      'Core Database Schema & API Contract Implementation',
    ];
    this.errorMessage = '';
  }

  // Submit
  onSubmit(): void {
    this.errorMessage = '';

    if (!this.projectTitle.trim()) {
      this.errorMessage = 'Please provide a project title.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!this.selectedDepartment) {
      this.errorMessage = 'Please select a parent corporate department.';
      return;
    }
    if (!this.selectedLeadId) {
      this.errorMessage = 'Please assign a project lead engineer.';
      return;
    }
    if (!this.startDate || !this.endDate) {
      this.errorMessage = 'Please specify both start and target completion dates.';
      return;
    }
    if (!this.description.trim()) {
      this.errorMessage = 'Please provide an executive summary or scope description.';
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {
      this.projectService.addProject({
        title: this.projectTitle,
        department: this.selectedDepartment,
        category: this.selectedCategory,
        description: this.description,
        startDate: this.startDate,
        endDate: this.endDate,
        leadId: this.selectedLeadId,
        priority: this.priority,
        methodology: this.methodology,
        budget: this.budget,
        teamMemberIds: this.selectedTeamMemberIds,
        milestones: this.milestones,
        externalToolUrl: this.externalToolUrl,
      });

      this.isSubmitting = false;
      this.isSuccess = true;

      setTimeout(() => {
        this.router.navigate(['/employee/project-management']);
      }, 1200);
    }, 650);
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
}
