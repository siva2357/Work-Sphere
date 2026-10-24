import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface EmployeeDocument {
  id: string;
  title: string;
  category: 'Employment' | 'Compensation' | 'Policy' | 'Separation';
  categoryLabel: string;
  issueDate: string;
  fileSize: string;
  fileFormat: 'PDF';
  badge?: string;
  badgeType?: 'emerald' | 'primary' | 'warning' | 'secondary' | 'danger';
  description: string;
}

@Component({
  selector: 'app-my-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-documents.html',
  styleUrl: './my-documents.css',
})
export class MyDocuments {
  // Filter by Category
  categoryFilter: string = 'ALL';

  // Download state feedback
  isDownloading: boolean = false;
  downloadSuccessMessage: string = '';

  // Available Categories
  categories: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Documents' },
    { key: 'Employment', label: 'Employment Letters' },
    { key: 'Compensation', label: 'Hike & Compensation' },
    { key: 'Policy', label: 'Company Policies' },
    { key: 'Separation', label: 'Separation & Relieving' },
  ];

  // Documents Dataset reflecting user's exact requirements:
  // Offer letter, hike letter, promotion letter, resignation letter, professional policies
  documentsList: EmployeeDocument[] = [
    {
      id: 'DOC-OFFER-2024',
      title: 'Offer Letter',
      category: 'Employment',
      categoryLabel: 'Employment Letter',
      issueDate: '12 Jan 2024',
      fileSize: '1.4 MB',
      fileFormat: 'PDF',
      badge: 'Verified',
      badgeType: 'emerald',
      description: 'Official employment offer letter with compensation structure and terms of employment.',
    },
    {
      id: 'DOC-HIKE-2026',
      title: 'Annual Salary Hike Letter',
      category: 'Compensation',
      categoryLabel: 'Compensation & Hike',
      issueDate: '01 Apr 2026',
      fileSize: '1.1 MB',
      fileFormat: 'PDF',
      badge: 'Latest',
      badgeType: 'emerald',
      description: 'Annual performance revision letter confirming compensation increment for FY 2026-27.',
    },
    {
      id: 'DOC-PROM-2026',
      title: 'Promotion Letter',
      category: 'Employment',
      categoryLabel: 'Employment Letter',
      issueDate: '15 Oct 2026',
      fileSize: '980 KB',
      fileFormat: 'PDF',
      badge: 'Latest',
      badgeType: 'emerald',
      description: 'Formal role elevation to Senior Full Stack Engineer with updated responsibilities.',
    },
    {
      id: 'DOC-RESIG-2026',
      title: 'Resignation & Relieving Letter',
      category: 'Separation',
      categoryLabel: 'Separation & Relieving',
      issueDate: '05 Aug 2026',
      fileSize: '850 KB',
      fileFormat: 'PDF',
      badge: 'Archived',
      badgeType: 'secondary',
      description: 'Official separation acknowledgment, formal service tenure record, and relieving terms.',
    },
    {
      id: 'DOC-POL-CONDUCT',
      title: 'Professional Code of Conduct Policy',
      category: 'Policy',
      categoryLabel: 'Company Policy',
      issueDate: 'Updated Oct 2026',
      fileSize: '2.4 MB',
      fileFormat: 'PDF',
      badge: 'Active Policy',
      badgeType: 'primary',
      description: 'Workplace standards, corporate governance, anti-harassment regulations, and professional ethics.',
    },
    {
      id: 'DOC-POL-ITSEC',
      title: 'IT Security & Acceptable Use Policy',
      category: 'Policy',
      categoryLabel: 'Company Policy',
      issueDate: 'Updated Sep 2026',
      fileSize: '1.8 MB',
      fileFormat: 'PDF',
      badge: 'Active Policy',
      badgeType: 'primary',
      description: 'Enterprise data confidentiality, VPN access protocols, device security, and cloud credential guidelines.',
    },
    {
      id: 'DOC-APPOINT-2024',
      title: 'Appointment & Confirmation Letter',
      category: 'Employment',
      categoryLabel: 'Employment Letter',
      issueDate: '15 Jul 2024',
      fileSize: '920 KB',
      fileFormat: 'PDF',
      badge: 'Verified',
      badgeType: 'emerald',
      description: 'Successful probation completion and permanent employee confirmation document.',
    },
    {
      id: 'DOC-NDA-2024',
      title: 'Non-Disclosure Agreement (NDA)',
      category: 'Employment',
      categoryLabel: 'Legal & Agreement',
      issueDate: '15 Jan 2024',
      fileSize: '1.6 MB',
      fileFormat: 'PDF',
      badge: 'Confidential',
      badgeType: 'warning',
      description: 'Proprietary technology protection, client data privacy, and intellectual property agreement.',
    },
    {
      id: 'DOC-POL-REMOTE',
      title: 'Hybrid & Remote Work Policy',
      category: 'Policy',
      categoryLabel: 'Company Policy',
      issueDate: 'Updated Aug 2026',
      fileSize: '1.2 MB',
      fileFormat: 'PDF',
      badge: 'Active Policy',
      badgeType: 'primary',
      description: 'Flexible hybrid workplace guidelines, home office connectivity standards, and attendance sync.',
    },
  ];

  // Filtered documents getter
  get filteredDocuments(): EmployeeDocument[] {
    return this.documentsList.filter((doc) => {
      // Category Filter
      if (this.categoryFilter !== 'ALL' && doc.category !== this.categoryFilter) {
        return false;
      }

      return true;
    });
  }

  // Count by category
  getCount(categoryKey: string): number {
    if (categoryKey === 'ALL') {
      return this.documentsList.length;
    }
    return this.documentsList.filter((d) => d.category === categoryKey).length;
  }

  // Download simulation
  downloadDocument(doc: EmployeeDocument): void {
    this.isDownloading = true;
    this.downloadSuccessMessage = '';

    setTimeout(() => {
      this.isDownloading = false;
      this.downloadSuccessMessage = `${doc.title} (${doc.fileFormat}) downloaded successfully!`;

      // Auto clear after 4 seconds
      setTimeout(() => {
        if (this.downloadSuccessMessage) {
          this.downloadSuccessMessage = '';
        }
      }, 4000);
    }, 600);
  }

  clearFilters(): void {
    this.categoryFilter = 'ALL';

  }
}
