import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button, ButtonVariant } from '../button/button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-modal, app-modals',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() size: ModalSize = 'md';
  @Input() centered = true;
  @Input() scrollable = false;
  @Input() closable = true;
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() showCancel = true;
  @Input() showConfirm = true;
  @Input() cancelLabel = 'Cancel';
  @Input() confirmLabel = 'Confirm';
  @Input() confirmVariant: ButtonVariant = 'emerald';
  @Input() confirmIcon = '';
  @Input() confirmDisabled = false;
  @Input() confirmLoading = false;
  @Input() confirmLoadingText = 'Processing...';
  @Input() customClass = '';

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get formattedIcon(): string {
    if (!this.icon) return '';
    return this.icon.startsWith('bi ') ? this.icon : `bi ${this.icon}`;
  }

  get dialogClasses(): string {
    const classes = ['ws-modal-dialog', `ws-modal-${this.size}`];
    if (this.centered) classes.push('ws-modal-centered');
    if (this.scrollable) classes.push('ws-modal-scrollable');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen && this.closable && this.closeOnEscape) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (
      this.closable &&
      this.closeOnBackdrop &&
      (event.target as HTMLElement).classList.contains('ws-modal-overlay')
    ) {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.closed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.close();
  }

  onConfirm(): void {
    if (this.confirmDisabled || this.confirmLoading) return;
    this.confirmed.emit();
  }
}
