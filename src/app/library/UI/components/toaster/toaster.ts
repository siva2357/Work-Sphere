import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type ToastVariant =
  | 'emerald'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'dark';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  icon?: string;
  durationMs?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private readonly toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  show(toast: Omit<ToastItem, 'id'> & { id?: string }): string {
    const id = toast.id || `ws-toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const durationMs = toast.durationMs ?? 4000;
    const item: ToastItem = { ...toast, id, durationMs };

    this.toastsSubject.next([...this.toastsSubject.value, item]);

    if (durationMs > 0) {
      setTimeout(() => this.remove(id), durationMs);
    }
    return id;
  }

  emerald(message: string, title = 'Success', durationMs = 4000): string {
    return this.show({ title, message, variant: 'emerald', durationMs });
  }

  success(message: string, title = 'Success', durationMs = 4000): string {
    return this.show({ title, message, variant: 'success', durationMs });
  }

  info(message: string, title = 'Info', durationMs = 4000): string {
    return this.show({ title, message, variant: 'info', durationMs });
  }

  warning(message: string, title = 'Warning', durationMs = 4500): string {
    return this.show({ title, message, variant: 'warning', durationMs });
  }

  error(message: string, title = 'Error', durationMs = 5000): string {
    return this.show({ title, message, variant: 'danger', durationMs });
  }

  remove(id: string): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}

@Component({
  selector: 'app-toaster, app-toasters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toaster.html',
  styleUrl: './toaster.css',
})
export class Toaster implements OnInit, OnDestroy {
  private readonly toasterService = inject(ToasterService);

  @Input() position: ToastPosition = 'top-right';
  @Input() toasts: ToastItem[] | null = null;

  // Standalone single-toast inputs (when used directly as an inline/floating toast)
  @Input() title = '';
  @Input() message = '';
  @Input() variant: ToastVariant = 'emerald';
  @Input() icon = '';
  @Input() visible = true;

  @Output() dismissed = new EventEmitter<string>();

  serviceToasts: ToastItem[] = [];

  ngOnInit(): void {
    this.toasterService.toasts$.subscribe((list) => {
      this.serviceToasts = list;
    });
  }

  ngOnDestroy(): void {}

  get activeToasts(): ToastItem[] {
    if (this.toasts && this.toasts.length > 0) {
      return this.toasts;
    }
    if (this.message && this.visible) {
      return [
        {
          id: 'inline-toast',
          title: this.title,
          message: this.message,
          variant: this.variant,
          icon: this.icon,
        },
      ];
    }
    return this.serviceToasts;
  }

  resolveIcon(item: ToastItem): string {
    if (item.icon) {
      return item.icon.startsWith('bi ') ? item.icon : `bi ${item.icon}`;
    }
    switch (item.variant) {
      case 'emerald':
      case 'success':
        return 'bi bi-check-circle-fill';
      case 'danger':
        return 'bi bi-x-circle-fill';
      case 'warning':
        return 'bi bi-exclamation-triangle-fill';
      case 'info':
        return 'bi bi-info-circle-fill';
      default:
        return 'bi bi-bell-fill';
    }
  }

  dismissToast(id: string): void {
    if (id === 'inline-toast') {
      this.visible = false;
    } else if (this.toasts) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    } else {
      this.toasterService.remove(id);
    }
    this.dismissed.emit(id);
  }
}
