import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'Urgent' | 'High' | 'Normal';
  targetAudience: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  isPinned: boolean;
  viewsCount: number;
}

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcements.html',
  styleUrl: './announcements.css',
})
export class Announcements implements OnInit {
  searchTerm = '';
  selectedFilter: 'All' | 'Company Wide' | 'Department' | 'Urgent' | 'Pinned' = 'All';

  // Modal
  showCreateModal = false;

  newAnnouncement = {
    title: '',
    category: 'Policy & Culture',
    priority: 'Normal' as 'Urgent' | 'High' | 'Normal',
    targetAudience: 'All Employees',
    content: '',
    isPinned: false
  };

  announcements: AnnouncementItem[] = [
    {
      id: 'ANN-101',
      title: 'Annual Health & Wellness Benefit Package Update for 2027',
      content: 'We are pleased to announce significant enhancements to our comprehensive health benefits! Starting January 1st, all full-time employees and their dependents will have increased dental, vision, and mental wellness coverage. Please review the updated policy handbook in your documents tab.',
      category: 'Benefits & Wellness',
      priority: 'Urgent',
      targetAudience: 'All Employees',
      authorName: 'Eleanor Vance',
      authorRole: 'Head of People & Culture',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      date: 'Today, 09:30 AM',
      isPinned: true,
      viewsCount: 214
    },
    {
      id: 'ANN-102',
      title: 'Hybrid Workplace Guidelines & Remote Collaboration Etiquette',
      content: 'As our teams scale across different time zones, we have updated our core collaboration hours (10:00 AM – 3:00 PM IST) to foster seamless team syncs while maintaining asynchronous deep work focus. Review the updated playbook.',
      category: 'Workplace Guidelines',
      priority: 'High',
      targetAudience: 'All Employees',
      authorName: 'Eleanor Vance',
      authorRole: 'Head of People & Culture',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      date: 'Oct 24, 2026',
      isPinned: true,
      viewsCount: 238
    },
    {
      id: 'ANN-103',
      title: 'Q4 Engineering Hackathon: "Build with AI" Announced!',
      content: 'Calling all developers, designers, and innovators! Our Q4 Internal Hackathon will be held from November 12th to November 14th. Great prizes, mentorship, and opportunities to ship customer-facing features. Registrations are now open.',
      category: 'Engineering & Tech',
      priority: 'Normal',
      targetAudience: 'Engineering & Product',
      authorName: 'Marcus Vance',
      authorRole: 'VP of Engineering',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      date: 'Oct 21, 2026',
      isPinned: false,
      viewsCount: 182
    },
    {
      id: 'ANN-104',
      title: 'Diwali & Autumn Festive Holidays Schedule',
      content: 'Please take note that the corporate offices will remain closed from November 1st to November 3rd in celebration of Diwali. Emergency on-call support rotations have already been coordinated with department leads.',
      category: 'Holidays & PTO',
      priority: 'Normal',
      targetAudience: 'All Employees',
      authorName: 'Eleanor Vance',
      authorRole: 'Head of People & Culture',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      date: 'Oct 19, 2026',
      isPinned: false,
      viewsCount: 245
    }
  ];

  ngOnInit(): void {}

  get filteredAnnouncements(): AnnouncementItem[] {
    return this.announcements.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (this.selectedFilter === 'Pinned') return item.isPinned;
      if (this.selectedFilter === 'Urgent') return item.priority === 'Urgent';
      if (this.selectedFilter === 'Company Wide') return item.targetAudience === 'All Employees';
      if (this.selectedFilter === 'Department') return item.targetAudience !== 'All Employees';
      return true;
    });
  }

  togglePin(item: AnnouncementItem) {
    item.isPinned = !item.isPinned;
  }

  deleteAnnouncement(id: string) {
    this.announcements = this.announcements.filter(a => a.id !== id);
  }

  openCreate() {
    this.showCreateModal = true;
  }

  closeCreate() {
    this.showCreateModal = false;
  }

  submitAnnouncement() {
    if (!this.newAnnouncement.title || !this.newAnnouncement.content) return;
    const item: AnnouncementItem = {
      id: `ANN-${100 + this.announcements.length + 1}`,
      title: this.newAnnouncement.title,
      content: this.newAnnouncement.content,
      category: this.newAnnouncement.category,
      priority: this.newAnnouncement.priority,
      targetAudience: this.newAnnouncement.targetAudience,
      authorName: 'Eleanor Vance',
      authorRole: 'Head of People & Culture',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      date: 'Just now',
      isPinned: this.newAnnouncement.isPinned,
      viewsCount: 1
    };
    if (item.isPinned) {
      this.announcements.unshift(item);
    } else {
      this.announcements.push(item);
    }
    this.closeCreate();
  }
}
