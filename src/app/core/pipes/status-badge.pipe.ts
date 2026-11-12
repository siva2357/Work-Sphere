import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true,
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: string | null | undefined): string {
    if (!status) return 'bg-secondary-subtle text-secondary';

    const normalized = status.trim().toLowerCase();
    switch (normalized) {
      case 'active':
      case 'present':
      case 'approved':
      case 'completed':
      case 'paid':
      case 'onboarded':
        return 'bg-success-subtle text-success';

      case 'in progress':
      case 'remote':
      case 'hybrid':
      case 'review':
      case 'in review':
        return 'bg-info-subtle text-info';

      case 'pending':
      case 'late':
      case 'half day':
      case 'on leave':
      case 'planning':
      case 'medium':
        return 'bg-warning-subtle text-warning';

      case 'rejected':
      case 'absent':
      case 'urgent':
      case 'high':
      case 'overdue':
        return 'bg-danger-subtle text-danger';

      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }
}

