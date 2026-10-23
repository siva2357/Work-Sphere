import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNotification } from '../../../../core/models/notification.model';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dropdown.html',
  styleUrl: './notification-dropdown.css'
})
export class NotificationDropdown implements OnInit {
  notifications: AppNotification[] = [
    {
      id: '1',
      title: 'Leave Request Approved',
      message: 'Your casual leave request for Nov 2nd has been approved by HR.',
      type: 'leave',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      link: '/employee/my-leaves'
    },
    {
      id: '2',
      title: 'Payroll Generated',
      message: 'Monthly salary slip for October 2026 is now available for download.',
      type: 'payroll',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      link: '/employee/my-payroll'
    },
    {
      id: '3',
      title: 'Company Announcement',
      message: 'All-hands meeting scheduled for tomorrow at 4:00 PM IST.',
      type: 'announcement',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      link: '/hr/announcements'
    }
  ];

  visibleLimit = 3;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get visibleNotifications(): AppNotification[] {
    return this.notifications.slice(0, this.visibleLimit);
  }

  ngOnInit(): void {}

  markAllAsRead(event: Event): void {
    event.preventDefault();
    this.notifications.forEach(n => n.read = true);
  }

  markAsRead(event: Event, id?: string): void {
    event.preventDefault();
    if (!id) return;
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }

  clearAll(event: Event): void {
    event.preventDefault();
    this.notifications = [];
  }

  viewMore(event: Event): void {
    event.preventDefault();
    this.visibleLimit = this.notifications.length;
  }

  viewLess(event: Event): void {
    event.preventDefault();
    this.visibleLimit = 3;
  }
}
