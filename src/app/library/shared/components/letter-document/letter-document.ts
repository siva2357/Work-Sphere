import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeDocument } from '../../../../core/models/workspace.interface';

@Component({
  selector: 'app-letter-document',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './letter-document.html',
  styleUrl: './letter-document.css',
})
export class LetterDocument {
  @Input({ required: true }) document!: EmployeeDocument;
  @Input() isDownloading: boolean = false;

  @Output() download = new EventEmitter<EmployeeDocument>();

  onDownload(event?: Event): void {
    event?.stopPropagation();
    this.download.emit(this.document);
  }
}
