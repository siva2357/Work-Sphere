import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatMetric } from '../../../../core/models/workspace.interface';

export type { StatMetric };

@Component({
  selector: 'app-stat-cards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stat-cards.html',
  styleUrl: './stat-cards.css',
})
export class StatCards {
  /**
   * Pass an array of StatMetric items to render a responsive grid row of stat cards.
   */
  @Input() cards: StatMetric[] = [];

  /**
   * Or pass a single StatMetric object (or individual inputs below) to render a single card.
   */
  @Input() card: StatMetric | null = null;

  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() badgeText = '';
  @Input() badgeType: string = 'emerald';
  @Input() icon = 'bi-grid-1x2-fill';
  @Input() route?: string;

  /**
   * Bootstrap column classes when rendering the `cards` array.
   */
  @Input() colClass = 'col-12 col-sm-6 col-xl-3';

  @Output() cardSelected = new EventEmitter<StatMetric>();

  get displayCards(): StatMetric[] {
    if (this.cards && this.cards.length > 0) {
      return this.cards;
    }
    if (this.card) {
      return [this.card];
    }
    if (this.title || this.value !== '') {
      return [
        {
          title: this.title,
          value: this.value,
          subtitle: this.subtitle,
          badgeText: this.badgeText,
          badgeType: this.badgeType,
          icon: this.icon,
          route: this.route,
        },
      ];
    }
    return [];
  }

  get isSingleMode(): boolean {
    return (!this.cards || this.cards.length === 0) && (!!this.card || !!this.title || this.value !== '');
  }

  onCardClick(item: StatMetric): void {
    this.cardSelected.emit(item);
  }

  getBadgeClass(type?: string): string {
    switch (type) {
      case 'success':
        return 'badge-soft-success';
      case 'warning':
        return 'badge-soft-warning';
      case 'info':
        return 'badge-soft-info';
      case 'danger':
        return 'badge-soft-danger';
      case 'primary':
        return 'badge-soft-primary';
      case 'secondary':
        return 'badge-soft-secondary';
      case 'emerald':
      default:
        return 'badge-soft-emerald';
    }
  }

  getIconAccentClass(type?: string): string {
    switch (type) {
      case 'success':
        return 'icon-accent-success';
      case 'warning':
        return 'icon-accent-warning';
      case 'info':
        return 'icon-accent-info';
      case 'danger':
        return 'icon-accent-danger';
      case 'primary':
        return 'icon-accent-primary';
      case 'emerald':
      default:
        return 'icon-accent-emerald';
    }
  }

  formatIcon(icon: string): string {
    if (!icon) return 'bi bi-grid-1x2-fill';
    return icon.startsWith('bi ') ? icon : `bi ${icon}`;
  }
}
