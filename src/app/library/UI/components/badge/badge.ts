import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant =
  | 'emerald'
  | 'soft-emerald'
  | 'outline-emerald'
  | 'primary'
  | 'soft-primary'
  | 'outline-primary'
  | 'secondary'
  | 'soft-secondary'
  | 'outline-secondary'
  | 'success'
  | 'soft-success'
  | 'outline-success'
  | 'warning'
  | 'soft-warning'
  | 'outline-warning'
  | 'danger'
  | 'soft-danger'
  | 'outline-danger'
  | 'info'
  | 'soft-info'
  | 'outline-info'
  | 'dark'
  | 'light';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge, app-badges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class Badge {
  @Input() label: string | number | null | undefined = '';
  @Input() variant: BadgeVariant = 'soft-emerald';
  @Input() size: BadgeSize = 'sm';
  @Input() icon = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() pill = true;
  @Input() dot = false;
  @Input() pulseDot = false;
  @Input() customClass = '';

  get formattedIcon(): string {
    if (!this.icon) return '';
    return this.icon.startsWith('bi ') ? this.icon : `bi ${this.icon}`;
  }

  get badgeClasses(): string {
    const classes = [
      'ws-badge',
      `ws-badge-${this.variant}`,
      `ws-badge-${this.size}`,
    ];
    if (this.pill) classes.push('rounded-pill');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }
}
