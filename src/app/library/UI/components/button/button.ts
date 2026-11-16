import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type ButtonVariant =
  | 'emerald'
  | 'outline-emerald'
  | 'soft-emerald'
  | 'link-emerald'
  | 'primary'
  | 'outline-primary'
  | 'soft-primary'
  | 'secondary'
  | 'outline-secondary'
  | 'success'
  | 'outline-success'
  | 'danger'
  | 'outline-danger'
  | 'soft-danger'
  | 'warning'
  | 'outline-warning'
  | 'info'
  | 'outline-info'
  | 'light'
  | 'outline-light'
  | 'dark'
  | 'outline-dark'
  | 'ghost'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  @Input() label = '';
  @Input() variant: ButtonVariant = 'emerald';
  @Input() size: ButtonSize = 'md';
  @Input() icon = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() loadingText = '';
  @Input() iconOnly = false;
  @Input() block = false;
  @Input() pill = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() route: string | null = null;
  @Input() target: string | null = null;
  @Input() title = '';
  @Input() customClass = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  constructor(private router: Router) {}

  get formattedIcon(): string {
    if (!this.icon) return '';
    return this.icon.startsWith('bi ') ? this.icon : `bi ${this.icon}`;
  }

  get buttonClasses(): string {
    const classes = [
      'ws-btn',
      `ws-btn-${this.variant}`,
      `ws-btn-${this.size}`,
    ];
    if (this.iconOnly) classes.push('ws-btn-icon-only');
    if (this.block) classes.push('w-100');
    if (this.pill) classes.push('rounded-pill');
    if (this.disabled) classes.push('disabled');
    if (this.loading) classes.push('loading');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }

  async onClick(event: MouseEvent): Promise<void> {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.clicked.emit(event);

    if (this.route) {
      if (this.target === '_blank') {
        window.open(
          this.router.serializeUrl(this.router.createUrlTree([this.route])),
          '_blank'
        );
      } else {
        await this.router.navigateByUrl(this.route);
      }
    }
  }
}
