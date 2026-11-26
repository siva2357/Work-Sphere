import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';
import { AnnouncementItem } from '../../../core/models/workspace.interface';
import { StatCards, StatMetric } from '../../../library/shared/components/stat-cards/stat-cards';
import { Button } from '../../../library/UI/components/button/button';

export type { AnnouncementItem };

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCards, Button],
  templateUrl: './announcements.html',
  styleUrl: './announcements.css',
})
export class Announcements implements OnInit {
  private workspaceService = inject(WorkspaceService);
  private authService = inject(AuthService);

  searchTerm = '';
  selectedFilter: 'All' | 'Company Wide' | 'Department' | 'Urgent' | 'Pinned' = 'All';

  showCreateModal = false;

  newAnnouncement = {
    title: '',
    category: 'Policy & Culture',
    priority: 'Normal' as 'Urgent' | 'High' | 'Normal',
    targetAudience: 'All Employees',
    content: '',
    isPinned: false,
  };

  announcements: AnnouncementItem[] = [];

  get statCards(): StatMetric[] {
    const pinnedCount = this.announcements.filter((a) => a.isPinned).length;
    return [
      {
        title: 'Total Broadcasts',
        value: this.announcements.length,
        subtitle: 'Published announcements',
        badgeText: 'Active',
        badgeType: 'emerald',
        icon: 'bi-megaphone',
      },
      {
        title: 'Pinned Notices',
        value: pinnedCount,
        subtitle: 'Urgent priority',
        badgeText: 'Top of feed',
        badgeType: 'warning',
        icon: 'bi-pin-angle-fill',
      },
      {
        title: 'Avg. Read Rate',
        value: '94.8%',
        subtitle: 'Across workforce',
        badgeText: 'Engaged',
        badgeType: 'success',
        icon: 'bi-eye',
      },
      {
        title: 'Target Reach',
        value: 'All Staff',
        subtitle: 'Company-wide & Dept notices',
        badgeText: 'Company',
        badgeType: 'info',
        icon: 'bi-broadcast-pin',
      },
    ];
  }

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    const empCode = this.authService.getCurrentEmployeeCode();
    const user = this.authService.currentUser;
    this.workspaceService.getMyDocuments$(empCode, 'Policy').subscribe((res: any) => {
      const docs = res?.documents || (Array.isArray(res) ? res : []);
      this.announcements = docs.map((d: any, idx: number) => ({
        id: d.documentCode || `ANN-${101 + idx}`,
        title: d.title,
        content: d.description || '',
        category: d.categoryLabel || 'Company Policy',
        priority: idx === 0 ? 'Urgent' : 'Normal',
        targetAudience: 'All Employees',
        authorName: user?.fullName || 'HR Department',
        authorRole: user?.designationTitle || 'People & Culture',
        authorAvatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        date: d.issueDate || 'Recent',
        isPinned: idx === 0,
        viewsCount: 42 + idx * 15,
      }));
    });
  }

  get filteredAnnouncements(): AnnouncementItem[] {
    return this.announcements.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (this.selectedFilter === 'Pinned') return item.isPinned;
      if (this.selectedFilter === 'Urgent') return item.priority === 'Urgent';
      if (this.selectedFilter === 'Company Wide')
        return item.targetAudience === 'All Employees';
      if (this.selectedFilter === 'Department')
        return item.targetAudience !== 'All Employees';
      return true;
    });
  }

  togglePin(item: AnnouncementItem): void {
    item.isPinned = !item.isPinned;
  }

  deleteAnnouncement(id: string): void {
    this.announcements = this.announcements.filter((a) => a.id !== id);
  }

  openCreate(): void {
    this.showCreateModal = true;
  }

  closeCreate(): void {
    this.showCreateModal = false;
  }

  submitAnnouncement(): void {
    if (!this.newAnnouncement.title || !this.newAnnouncement.content) return;
    this.workspaceService
      .createDocument$({
        title: this.newAnnouncement.title,
        category: 'Policy',
        categoryLabel: this.newAnnouncement.category || 'Company Policy',
        description: this.newAnnouncement.content,
        badge: this.newAnnouncement.priority === 'Urgent' ? 'Urgent' : 'General',
        badgeType: this.newAnnouncement.priority === 'Urgent' ? 'warning' : 'emerald',
      })
      .subscribe(() => {
        this.closeCreate();
        this.loadAnnouncements();
      });
  }
}
