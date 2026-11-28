import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../../core/services/request.service';
import { AuthService, AuthenticatedUser } from '../../../../core/services/auth.service';
import { Button, InputField, InputDropdownOption, Alert, Badge, Chip } from '../../../../library/UI/components';

@Component({
  selector: 'app-apply-request',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, InputField, Alert, Badge, Chip],
  templateUrl: './apply-request.html',
  styleUrl: './apply-request.css',
})
export class ApplyRequest implements OnInit {
  private router = inject(Router);
  private requestService = inject(RequestService);
  private authService = inject(AuthService);

  currentUser: AuthenticatedUser | null = null;

  // Form Fields
  category: string = '';
  priority: string = 'Medium';
  subject: string = '';
  description: string = '';
  requiredDate: string = '';
  location: string = 'Hyderabad Campus (Building 4)';

  // Seeded categories fetched directly from Backend
  categoryOptions: InputDropdownOption[] = [];
  isLoadingCategories: boolean = false;

  // Submission state
  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.authService.currentUser$.subscribe((u) => {
      this.currentUser = u;
    });

    this.isLoadingCategories = true;
    this.requestService.fetchRequestCategories$().subscribe({
      next: (cats) => {
        this.isLoadingCategories = false;
        if (cats && cats.length > 0) {
          this.categoryOptions = cats.map((c) => ({
            label: c.label,
            value: c.value,
          }));
        }
      },
      error: () => {
        this.isLoadingCategories = false;
      },
    });
  }

  get userInitials(): string {
    if (!this.currentUser?.fullName) return 'EM';
    return this.currentUser.fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  setPriority(level: string): void {
    this.priority = level;
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

    if (this.category === 'Resignation Request' && !this.requiredDate) {
      this.errorMessage = 'Please select your proposed last working day for resignation.';
      return;
    }

    this.isSubmitting = true;

    this.requestService
      .createRequest$({
        category: this.category,
        subject: this.subject.trim(),
        description: this.description.trim(),
        priority: this.priority,
        employeeId: this.currentUser?.id,
        employeeCode: this.currentUser?.employeeCode,
        proposedLastWorkingDay: this.category === 'Resignation Request' && this.requiredDate ? new Date(this.requiredDate).toISOString() : undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.isSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/my-requests']);
          }, 1200);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage =
            err?.error?.message ||
            (err?.error?.errors ? Object.values(err.error.errors).flat().join(' ') : null) ||
            'Unable to submit request. Please try again.';
        },
      });
  }
}
