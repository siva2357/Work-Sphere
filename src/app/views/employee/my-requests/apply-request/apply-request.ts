import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../../core/services/request.service';

@Component({
  selector: 'app-apply-request',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './apply-request.html',
  styleUrl: './apply-request.css',
})
export class ApplyRequest {
  // Form Fields
  category: string = '';
  priority: string = 'Medium';
  subject: string = '';
  description: string = '';
  requiredDate: string = '';
  location: string = 'Hyderabad Campus (Building 4)';

  // Categories list matching user workflows
  categories: string[] = [
    'Hardware / Asset',
    'IT & System Access',
    'Promotion Request',
    'Appraisal & Salary Review',
    'Department Transfer',
    'Resignation Request',
    'Work From Home',
    'Expense Reimbursement',
    'Software License',
    'Office Supplies & Ergonomics',
  ];

  // Attachment simulation
  selectedFileName: string = '';

  // Submission state
  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private requestService: RequestService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFileName = file.name;
    }
  }

  removeFile(): void {
    this.selectedFileName = '';
  }

  submitRequest(): void {
    this.errorMessage = '';

    if (!this.category) {
      this.errorMessage = 'Please select a request category.';
      return;
    }

    if (!this.subject.trim()) {
      this.errorMessage = 'Please enter a request subject.';
      return;
    }

    if (!this.description.trim()) {
      this.errorMessage = 'Please provide details / justification for your request.';
      return;
    }

    this.isSubmitting = true;

    this.requestService.createRequest$({
      category: this.category,
      subject: this.subject.trim(),
      description: this.description.trim(),
      priority: this.priority
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/employee/my-requests']);
        }, 1200);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Unable to submit request. Please try again.';
      }
    });
  }
}
