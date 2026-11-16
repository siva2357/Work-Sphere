import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyPayrollRecord } from '../../../../core/models/workspace.interface';

@Component({
  selector: 'app-payslip-document',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payslip-document.html',
  styleUrl: './payslip-document.css',
})
export class PayslipDocument {
  @Input({ required: true }) record!: MonthlyPayrollRecord;
  @Input() isLatest: boolean = false;
  @Input() isDownloading: boolean = false;

  @Output() download = new EventEmitter<MonthlyPayrollRecord>();

  onDownload(event?: Event): void {
    event?.stopPropagation();
    this.download.emit(this.record);
  }
}
