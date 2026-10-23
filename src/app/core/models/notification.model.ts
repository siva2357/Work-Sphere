export type NotificationType = 'leave' | 'payroll' | 'announcement' | 'general';

export interface AppNotification {
  id?: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  read: boolean;
  createdAt?: string;
  time?: string;
}

