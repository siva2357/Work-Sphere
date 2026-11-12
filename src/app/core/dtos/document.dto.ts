export interface CreateEmployeeDocumentDto {
  employeeCode?: string;
  title: string;
  category: 'Employment' | 'Compensation' | 'Policy' | 'Separation' | string;
  categoryLabel: string;
  issueDate?: string;
  fileSize?: string;
  fileFormat?: string;
  badge?: string;
  badgeType?: string;
  description: string;
  fileUrl?: string;
}

