import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeRecord } from '../../../../core/models/company-directory.interface';
import { Button } from '../../../UI/components/button/button';

export type { EmployeeRecord };

@Component({
  selector: 'app-employee-card',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './employee-card.html',
  styleUrl: './employee-card.css',
})
export class EmployeeCard {
  /**
   * Pass a single EmployeeRecord to render an individual employee card.
   */
  @Input() employee: EmployeeRecord | null = null;

  /**
   * Or pass an array of EmployeeRecord items to render a responsive grid of employee cards.
   */
  @Input() employees: EmployeeRecord[] = [];

  /**
   * Bootstrap column classes when rendering `employees` grid.
   */
  @Input() colClass = 'col-12 col-md-6 col-xl-3';

  @Output() viewProfile = new EventEmitter<EmployeeRecord>();

  get isGridMode(): boolean {
    return Array.isArray(this.employees) && this.employees.length > 0 && !this.employee;
  }

  onSelectEmployee(emp: EmployeeRecord, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.viewProfile.emit(emp);
  }

  getStatusDotClass(status: EmployeeRecord['status']): string {
    switch (status) {
      case 'Active':
        return 'bg-success';
      case 'Remote':
        return 'bg-info';
      case 'On Leave':
        return 'bg-warning';
      default:
        return 'bg-success';
    }
  }

  getStatusBadgeClass(status: EmployeeRecord['status']): string {
    switch (status) {
      case 'Active':
        return 'status-pill-active';
      case 'Remote':
        return 'status-pill-remote';
      case 'On Leave':
        return 'status-pill-leave';
      default:
        return 'status-pill-active';
    }
  }
}
