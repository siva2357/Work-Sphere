import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge, BadgeVariant } from '../badge/badge';

export type AccordianVariant = 'default' | 'emerald' | 'bordered';

export interface AccordianItem {
  id: string | number;
  title: string;
  subtitle?: string;
  content?: string;
  icon?: string;
  codeBadge?: string;
  countBadge?: string;
  statusBadge?: string;
  statusVariant?: BadgeVariant;
  isOpen?: boolean;
  disabled?: boolean;
  data?: any;
}

@Component({
  selector: 'app-accordian, app-accordion',
  standalone: true,
  imports: [CommonModule, Badge],
  templateUrl: './accordian.html',
  styleUrl: './accordian.css',
})
export class Accordian {
  // Single-Panel Mode Inputs
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() codeBadge = '';
  @Input() countBadge = '';
  @Input() statusBadge = '';
  @Input() statusVariant: BadgeVariant = 'soft-emerald';
  @Input() variant: AccordianVariant = 'default';
  @Input() isOpen = false;
  @Input() disabled = false;
  @Input() customClass = '';

  // Multi-Item List Mode Inputs (Optional)
  @Input() items: AccordianItem[] = [];
  @Input() allowMultiple = true;
  @Input() bodyTemplate?: TemplateRef<any>;
  @Input() actionsTemplate?: TemplateRef<any>;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() toggled = new EventEmitter<boolean>();
  @Output() itemToggled = new EventEmitter<AccordianItem>();

  get isListMode(): boolean {
    return Array.isArray(this.items) && this.items.length > 0;
  }

  get formattedIcon(): string {
    if (!this.icon) return '';
    return this.icon.startsWith('bi ') ? this.icon : `bi ${this.icon}`;
  }

  formatItemIcon(icon?: string): string {
    if (!icon) return '';
    return icon.startsWith('bi ') ? icon : `bi ${icon}`;
  }

  toggleSingle(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
    this.toggled.emit(this.isOpen);
  }

  toggleItem(item: AccordianItem): void {
    if (item.disabled) return;
    const nextState = !item.isOpen;
    if (!this.allowMultiple && nextState) {
      this.items.forEach((i) => (i.isOpen = false));
    }
    item.isOpen = nextState;
    this.itemToggled.emit(item);
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
