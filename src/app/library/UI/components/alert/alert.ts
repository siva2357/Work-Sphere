import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant =
  | 'emerald'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'primary'
  | 'secondary'
  | 'dark';

export type AlertAppearance = 'soft' | 'outline' | 'solid';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  @Input() title = '';
  @Input() message = '';
  @Input() variant: AlertVariant = 'emerald';
  @Input() appearance: AlertAppearance = 'soft';
  @Input() icon = '';
  @Input() showIcon = true;
  @Input() dismissible = false;
  @Input() visible = true;
  @Input() customClass = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() dismissed = new EventEmitter<void>();

  get resolvedIcon(): string {
    if (this.icon) {
      return this.icon.startsWith('bi ') ? this.icon : `bi ${this.icon}`;
    }
    switch (this.variant) {
      case 'emerald':
      case 'success':
        return 'bi bi-check-circle-fill';
      case 'danger':
        return 'bi bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi bi-exclamation-circle-fill';
      case 'info':
      case 'primary':
        return 'bi bi-info-circle-fill';
      default:
        return 'bi bi-bell-fill';
    }
  }

  get alertClasses(): string {
    const classes = [
      'ws-alert',
      `ws-alert-${this.variant}`,
      `ws-alert-${this.appearance}`,
    ];
    if (this.customClass) {
      classes.push(this.customClass);
    }
    return classes.join(' ');
  }

  dismiss(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.dismissed.emit();
  }
}
