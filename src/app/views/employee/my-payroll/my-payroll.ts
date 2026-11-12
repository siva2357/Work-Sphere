import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';
import { MonthlyPayrollRecord } from '../../../core/models/workspace.interface';

export type { MonthlyPayrollRecord };

@Component({
  selector: 'app-my-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-payroll.html',
  styleUrl: './my-payroll.css',
})
export class MyPayroll implements OnInit {
  private workspaceService = inject(WorkspaceService);
  private authService = inject(AuthService);

  selectedFY: string = 'FY 2026-27';
  availableFYs: string[] = ['FY 2026-27', 'FY 2025-26', 'FY 2024-25'];

  docTypeFilter: string = 'ALL';
  searchTerm: string = '';

  employeeInfo = {
    name: '',
    employeeId: '',
    designation: '',
    department: '',
    joiningDate: '',
    bankName: 'HDFC Bank Ltd.',
    accountNo: '•••• •••• 4821',
    ifscCode: 'HDFC0001234',
    panNumber: 'ABCDE1234F',
    uanNumber: '100984729102',
    pfNumber: 'MH/BAN/0048219/000/1042',
  };

  currentMonthNetPay: number = 0;
  annualCtc: number = 0;
  totalTdsYtd: number = 0;
  totalPfYtd: number = 0;
  nextPayDate: string = '';

  selectedModalRecord: MonthlyPayrollRecord | null = null;
  showPayslipModal: boolean = false;
  isDownloading: boolean = false;
  downloadSuccessMessage: string = '';

  monthlyRecords: MonthlyPayrollRecord[] = [];

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.employeeInfo.name = user.fullName || '';
      this.employeeInfo.employeeId = user.employeeCode || '';
      this.employeeInfo.designation = user.designationTitle || '';
      this.employeeInfo.department = user.departmentName || '';
    }

    const empCode = this.authService.getCurrentEmployeeCode();
    this.workspaceService.getMyPayroll$(empCode).subscribe((res: any) => {
      if (res?.employee) {
        this.employeeInfo.name = res.employee.fullName || this.employeeInfo.name;
        this.employeeInfo.employeeId = res.employee.employeeCode || this.employeeInfo.employeeId;
        this.employeeInfo.designation = res.employee.designation || this.employeeInfo.designation;
        this.employeeInfo.department = res.employee.department || this.employeeInfo.department;
        this.employeeInfo.joiningDate = res.employee.joiningDate || this.employeeInfo.joiningDate;
      }
      if (res?.summary) {
        this.currentMonthNetPay = Number(res.summary.currentMonthNetPay ?? 0);
        this.annualCtc = Number(res.summary.annualCtc ?? 0);
        this.totalTdsYtd = Number(res.summary.totalTdsYtd ?? 0);
        this.totalPfYtd = Number(res.summary.totalPfYtd ?? 0);
        this.nextPayDate = res.summary.nextPayDate || '';
      }
      const slips = res?.payslips || (Array.isArray(res) ? res : []);
      this.monthlyRecords = slips.map((s: any) => ({
        month: s.month || '',
        monthShort: s.monthShort || '',
        financialYear: s.financialYear || 'FY 2026-27',
        payDate: s.payDate || '',
        status: (s.status as MonthlyPayrollRecord['status']) || 'Paid',
        basicSalary: Number(s.basicSalary ?? 0),
        hra: Number(s.hra ?? 0),
        specialAllowance: Number(s.specialAllowance ?? 0),
        conveyance: Number(s.conveyance ?? 0),
        medicalAllowance: Number(s.medicalAllowance ?? 0),
        grossEarnings: Number(s.grossEarnings ?? 0),
        epfDeduction: Number(s.epfDeduction ?? 0),
        professionalTax: Number(s.professionalTax ?? 0),
        tdsDeduction: Number(s.tdsDeduction ?? 0),
        insuranceDeduction: Number(s.insuranceDeduction ?? 0),
        totalDeductions: Number(s.totalDeductions ?? 0),
        netSalary: Number(s.netSalary ?? 0),
        salarySlipPdf: {
          fileName:
            s.salarySlipFileName ||
            `WorkSphere_Payslip_${(s.monthShort || 'Slip').replace(' ', '_')}.pdf`,
          fileSize: '142 KB',
          downloadUrl: '#',
        },
        taxSlipPdf: {
          fileName:
            s.taxSlipFileName ||
            `WorkSphere_TDS_TaxSlip_${(s.monthShort || 'Slip').replace(' ', '_')}.pdf`,
          fileSize: '98 KB',
          downloadUrl: '#',
        },
      }));
      this.onFYChange();
    });
  }

  get currentMonthRecord(): MonthlyPayrollRecord {
    return (
      this.monthlyRecords[0] || {
        month: '',
        monthShort: '',
        financialYear: this.selectedFY,
        payDate: '',
        status: 'Paid',
        basicSalary: 0,
        hra: 0,
        specialAllowance: 0,
        conveyance: 0,
        medicalAllowance: 0,
        grossEarnings: 0,
        epfDeduction: 0,
        professionalTax: 0,
        tdsDeduction: 0,
        insuranceDeduction: 0,
        totalDeductions: 0,
        netSalary: 0,
        salarySlipPdf: { fileName: '', fileSize: '', downloadUrl: '#' },
        taxSlipPdf: { fileName: '', fileSize: '', downloadUrl: '#' },
      }
    );
  }

  get filteredRecords(): MonthlyPayrollRecord[] {
    return this.monthlyRecords.filter((rec) => {
      if (rec.financialYear !== this.selectedFY) {
        return false;
      }
      if (this.searchTerm.trim() !== '') {
        const query = this.searchTerm.toLowerCase();
        if (!rec.month.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }

  onFYChange(): void {
    const fyRecs = this.monthlyRecords.filter((r) => r.financialYear === this.selectedFY);
    if (fyRecs.length > 0) {
      this.currentMonthNetPay = fyRecs[0].netSalary;
      this.totalTdsYtd = fyRecs.reduce((sum, r) => sum + r.tdsDeduction, 0);
      this.totalPfYtd = fyRecs.reduce((sum, r) => sum + r.epfDeduction, 0);
    } else {
      this.currentMonthNetPay = 0;
      this.totalTdsYtd = 0;
      this.totalPfYtd = 0;
    }
  }

  openPayslipModal(record: MonthlyPayrollRecord): void {
    this.selectedModalRecord = record;
    this.showPayslipModal = true;
  }

  closePayslipModal(): void {
    this.showPayslipModal = false;
    this.selectedModalRecord = null;
  }

  downloadSlip(record: MonthlyPayrollRecord, type: 'salary' | 'tax' = 'salary'): void {
    this.isDownloading = true;
    const docName = type === 'salary' ? record.salarySlipPdf.fileName : record.taxSlipPdf.fileName;

    setTimeout(() => {
      this.isDownloading = false;
      this.downloadSuccessMessage = `Downloaded ${docName}`;
      this.generatePrintableSlip(record, type);

      setTimeout(() => {
        this.downloadSuccessMessage = '';
      }, 3500);
    }, 600);
  }

  private generatePrintableSlip(record: MonthlyPayrollRecord, type: 'salary' | 'tax' = 'salary'): void {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) return;

    const isSalary = type === 'salary';
    const title = isSalary
      ? `Salary Payslip - ${record.month}`
      : `Tax Deduction (TDS) Certificate - ${record.month}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 30px; font-size: 13px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 20px; }
          .company-logo { font-size: 20px; font-weight: bold; color: #10b981; }
          .slip-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 12px; }
          .info-table .label { font-weight: 600; background-color: #f8fafc; width: 25%; color: #475569; }
          .breakdown-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .breakdown-table th { background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 8px 10px; text-align: left; font-size: 12px; font-weight: 600; }
          .breakdown-table td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 12px; }
          .text-right { text-align: right; }
          .net-box { background: #f0fdf4; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin-top: 15px; display: flex; justify-content: space-between; align-items: center; }
          .net-val { font-size: 22px; font-weight: bold; color: #047857; }
          .footer { margin-top: 35px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-logo">Work-Sphere Technologies</div>
            <div style="font-size: 11px; color: #64748b;">Enterprise Workforce & Payroll Management System</div>
          </div>
          <div style="text-align: right;">
            <div class="slip-title">${title}</div>
            <div style="font-size: 12px; color: #64748b;">Disbursed: ${record.payDate}</div>
          </div>
        </div>
        <table class="info-table">
          <tr>
            <td class="label">Employee Name</td>
            <td><strong>${this.employeeInfo.name}</strong></td>
            <td class="label">Employee ID</td>
            <td><strong>${this.employeeInfo.employeeId}</strong></td>
          </tr>
          <tr>
            <td class="label">Designation</td>
            <td>${this.employeeInfo.designation}</td>
            <td class="label">Department</td>
            <td>${this.employeeInfo.department}</td>
          </tr>
        </table>
        <div class="net-box">
          <div>
            <div style="font-size: 12px; text-transform: uppercase; color: #065f46; font-weight: 600;">Net Payable Salary</div>
          </div>
          <div class="net-val">₹${record.netSalary.toLocaleString('en-IN')}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}
