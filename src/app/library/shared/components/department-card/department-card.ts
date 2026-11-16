import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../../UI/components/button/button';
import {
  DepartmentHierarchyItem,
  SubDepartmentItem,
} from '../../../../core/dtos/rbac.dto';

@Component({
  selector: 'app-department-card',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './department-card.html',
  styleUrl: './department-card.css',
})
export class DepartmentCard {
  @Input({ required: true }) department!: DepartmentHierarchyItem;

  @Output() addSubDepartment = new EventEmitter<string>();
  @Output() editDepartment = new EventEmitter<DepartmentHierarchyItem | SubDepartmentItem>();
  @Output() deleteDepartment = new EventEmitter<DepartmentHierarchyItem | SubDepartmentItem>();

  onAddSub(): void {
    this.addSubDepartment.emit(this.department.id);
  }

  onEdit(item: DepartmentHierarchyItem | SubDepartmentItem): void {
    this.editDepartment.emit(item);
  }

  onDelete(item: DepartmentHierarchyItem | SubDepartmentItem): void {
    this.deleteDepartment.emit(item);
  }
}

