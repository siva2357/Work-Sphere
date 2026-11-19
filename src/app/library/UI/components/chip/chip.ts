import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ChipVariant =
  | 'emerald'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'dark';

export type ChipSize = 'xs' | 'sm' | 'md';

@Component({
  selector: 'app-chip, app-chips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chip.html',
  styleUrl: './chip.css',
})
export class Chip {
  @Input() label = '';
  @Input() value: any = null;
  @Input() variant: ChipVariant = 'emerald';
  @Input() size: ChipSize = 'sm';
  @Input() icon = '';
  @Input() avatar = '';
  @Input() outline = false;
  @Input() selectable = false;
  @Input() selected = false;
  @Input() removable = false;
  @Input() disabled = false;
  @Input() customClass = '';

  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() removed = new EventEmitter<any>();
  @Output() clicked = new EventEmitter<MouseEvent>();

  get formattedIcon(): string {
    if (!this.icon) return '';
    return this.icon.startsWith('bi ') ? this.icon : `bi ${this.icon}`;
  }

  get chipClasses(): string {
    const classes = [
      'ws-chip',
      `ws-chip-${this.variant}`,
      `ws-chip-${this.size}`,
    ];
    if (this.outline) classes.push('ws-chip-outline');
    if (this.selectable) classes.push('ws-chip-selectable');
    if (this.selected) classes.push('ws-chip-selected');
    if (this.disabled) classes.push('ws-chip-disabled');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }

  onChipClick(event: MouseEvent): void {
    if (this.disabled) return;
    if (this.selectable) {
      this.selected = !this.selected;
      this.selectedChange.emit(this.selected);
    }
    this.clicked.emit(event);
  }

  onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.removed.emit(this.value ?? this.label);
  }
}
