import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {}

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

    // Simulate submission
    setTimeout(() => {
      this.isSubmitting = false;
      this.isSuccess = true;

      // Redirect back to My Requests page after 1.5 seconds
      setTimeout(() => {
        this.router.navigate(['/employee/my-requests']);
      }, 1500);
    }, 1200);
  }
}
