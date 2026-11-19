import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../../UI/components/button/button';
import { Badge } from '../../../UI/components/badge/badge';
import {
  DesignationItem,
  OrganizationalLevelHierarchyItem,
} from '../../../../core/dtos/rbac.dto';

@Component({
  selector: 'app-level-designation-card',
  standalone: true,
  imports: [CommonModule, Button, Badge],
  templateUrl: './level-designation-card.html',
  styleUrl: './level-designation-card.css',
})
export class LevelDesignationCard {
  @Input({ required: true }) level!: OrganizationalLevelHierarchyItem;

  @Output() addDesignation = new EventEmitter<{ levelId: string; hierarchyTrack: string }>();
  @Output() editDesignation = new EventEmitter<DesignationItem>();
  @Output() deleteDesignation = new EventEmitter<DesignationItem>();

  onAddDesignation(): void {
    this.addDesignation.emit({
      levelId: this.level.id,
      hierarchyTrack: this.level.hierarchyTrack,
    });
  }

  onEdit(desig: DesignationItem): void {
    this.editDesignation.emit(desig);
  }

  onDelete(desig: DesignationItem): void {
    this.deleteDesignation.emit(desig);
  }
}
