import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeDocument } from '../../../core/models/workspace.interface';

export type { EmployeeDocument };

@Component({
  selector: 'app-my-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-documents.html',
  styleUrl: './my-documents.css',
})
export class MyDocuments implements OnInit {
  private workspaceService = inject(WorkspaceService);
  private authService = inject(AuthService);

  categoryFilter: string = 'ALL';
  isDownloading: boolean = false;
  downloadSuccessMessage: string = '';

  categories: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Documents' },
    { key: 'Employment', label: 'Employment Letters' },
    { key: 'Compensation', label: 'Hike & Compensation' },
    { key: 'Policy', label: 'Company Policies' },
    { key: 'Separation', label: 'Separation & Relieving' },
  ];

  documentsList: EmployeeDocument[] = [];

  ngOnInit(): void {
    const empCode = this.authService.getCurrentEmployeeCode();
    this.workspaceService.getMyDocuments$(empCode).subscribe((res: any) => {
      const docs = res?.documents || (Array.isArray(res) ? res : []);
      this.documentsList = docs.map((d: any) => ({
        id: d.documentCode || d.id || 'DOC-001',
        title: d.title,
        category: (d.category as EmployeeDocument['category']) || 'Employment',
        categoryLabel: d.categoryLabel || `${d.category} Document`,
        issueDate: d.issueDate || '',
        fileSize: d.fileSize || '1.2 MB',
        fileFormat: 'PDF',
        badge: d.badge || 'Verified',
        badgeType: d.badgeType || 'emerald',
        description: d.description || '',
      }));
    });
  }

  get filteredDocuments(): EmployeeDocument[] {
    return this.documentsList.filter((doc) => {
      if (this.categoryFilter !== 'ALL' && doc.category !== this.categoryFilter) {
        return false;
      }
      return true;
    });
  }

  getCount(categoryKey: string): number {
    if (categoryKey === 'ALL') {
      return this.documentsList.length;
    }
    return this.documentsList.filter((d) => d.category === categoryKey).length;
  }

  downloadDocument(doc: EmployeeDocument): void {
    this.isDownloading = true;
    this.downloadSuccessMessage = '';

    setTimeout(() => {
      this.isDownloading = false;
      this.downloadSuccessMessage = `${doc.title} (${doc.fileFormat}) downloaded successfully!`;

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
