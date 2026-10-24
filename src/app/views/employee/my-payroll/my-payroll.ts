import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MonthlyPayrollRecord {
  month: string;           // e.g. "October 2026"
  monthShort: string;      // e.g. "Oct 2026"
  financialYear: string;   // e.g. "FY 2026-27"
  payDate: string;         // e.g. "31 Oct 2026"
  status: 'Paid' | 'Processing' | 'Upcoming';
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  medicalAllowance: number;
  grossEarnings: number;
  epfDeduction: number;
  professionalTax: number;
  tdsDeduction: number;
  insuranceDeduction: number;
  totalDeductions: number;
  netSalary: number;
  salarySlipPdf: {
    fileName: string;
    fileSize: string;
    downloadUrl: string;
  };
  taxSlipPdf: {
    fileName: string;
    fileSize: string;
    downloadUrl: string;
  };
}

@Component({
  selector: 'app-my-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-payroll.html',
  styleUrl: './my-payroll.css',
})
export class MyPayroll {
  // Financial Year Filter
  selectedFY: string = 'FY 2026-27';
  availableFYs: string[] = ['FY 2026-27', 'FY 2025-26', 'FY 2024-25'];

  // Document Type Filter: 'ALL' | 'SALARY' | 'TAX'
  docTypeFilter: string = 'ALL';
  searchTerm: string = '';

  // Employee Information for Payslip
  employeeInfo = {
    name: 'John Doe',
    employeeId: 'WS-EMP-1042',
    designation: 'Senior Software Engineer',
    department: 'Engineering (Frontend)',
    joiningDate: '15 Jan 2024',
    bankName: 'HDFC Bank Ltd.',
    accountNo: '•••• •••• 4821',
    ifscCode: 'HDFC0001234',
    panNumber: 'ABCDE1234F',
    uanNumber: '100984729102',
    pfNumber: 'MH/BAN/0048219/000/1042',
  };

  // Top Stat Totals
  currentMonthNetPay: number = 85400;
  annualCtc: number = 1250000;
  totalTdsYtd: number = 29400; // 7 months * 4200
  totalPfYtd: number = 25200;  // 7 months * 3600
  nextPayDate: string = '31 Oct 2026';

  // Modal active payslip
  selectedModalRecord: MonthlyPayrollRecord | null = null;
  showPayslipModal: boolean = false;
  isDownloading: boolean = false;
  downloadSuccessMessage: string = '';

  // All Monthly Payroll Records (Financial Year 2026-27: April 2026 to March 2027)
  monthlyRecords: MonthlyPayrollRecord[] = [
    {
      month: 'October 2026',
      monthShort: 'Oct 2026',
      financialYear: 'FY 2026-27',
      payDate: '31 Oct 2026',
      status: 'Paid',
      basicSalary: 45000,
      hra: 22500,
      specialAllowance: 17500,
      conveyance: 4000,
      medicalAllowance: 6000,
      grossEarnings: 95000,
      epfDeduction: 3600,
      professionalTax: 200,
      tdsDeduction: 4200,
      insuranceDeduction: 1600,
      totalDeductions: 9600,
      netSalary: 85400,
      salarySlipPdf: {
        fileName: 'WorkSphere_Payslip_Oct_2026.pdf',
        fileSize: '142 KB',
        downloadUrl: '#',
      },
      taxSlipPdf: {
        fileName: 'WorkSphere_TDS_TaxSlip_Oct_2026.pdf',
        fileSize: '98 KB',
        downloadUrl: '#',
      },
    },
    {
      month: 'September 2026',
      monthShort: 'Sep 2026',
      financialYear: 'FY 2026-27',
      payDate: '30 Sep 2026',
      status: 'Paid',
      basicSalary: 45000,
      hra: 22500,
      specialAllowance: 17500,
      conveyance: 4000,
      medicalAllowance: 6000,
      grossEarnings: 95000,
      epfDeduction: 3600,
      professionalTax: 200,
      tdsDeduction: 4200,
      insuranceDeduction: 1600,
      totalDeductions: 9600,
      netSalary: 85400,
      salarySlipPdf: {
        fileName: 'WorkSphere_Payslip_Sep_2026.pdf',
        fileSize: '140 KB',
        downloadUrl: '#',
      },
      taxSlipPdf: {
        fileName: 'WorkSphere_TDS_TaxSlip_Sep_2026.pdf',
        fileSize: '97 KB',
        downloadUrl: '#',
      },
    },
    {
      month: 'August 2026',
      monthShort: 'Aug 2026',
      financialYear: 'FY 2026-27',
      payDate: '31 Aug 2026',
      status: 'Paid',
      basicSalary: 45000,
      hra: 22500,
      specialAllowance: 17500,
      conveyance: 4000,
      medicalAllowance: 6000,
      grossEarnings: 95000,
      epfDeduction: 3600,
      professionalTax: 200,
      tdsDeduction: 4200,
      insuranceDeduction: 1600,
      totalDeductions: 9600,
      netSalary: 85400,
      salarySlipPdf: {
        fileName: 'WorkSphere_Payslip_Aug_2026.pdf',
        fileSize: '141 KB',
        downloadUrl: '#',
      },
      taxSlipPdf: {
        fileName: 'WorkSphere_TDS_TaxSlip_Aug_2026.pdf',
        fileSize: '96 KB',
        downloadUrl: '#',
      },
    },
    {
      month: 'July 2026',
      monthShort: 'Jul 2026',
      financialYear: 'FY 2026-27',
      payDate: '31 Jul 2026',
      status: 'Paid',
      basicSalary: 45000,
      hra: 22500,
      specialAllowance: 17500,
      conveyance: 4000,
      medicalAllowance: 6000,
      grossEarnings: 95000,
      epfDeduction: 3600,
      professionalTax: 200,
      tdsDeduction: 4200,
      insuranceDeduction: 1600,
      totalDeductions: 9600,
      netSalary: 85400,
      salarySlipPdf: {
        fileName: 'WorkSphere_Payslip_Jul_2026.pdf',
        fileSize: '139 KB',
        downloadUrl: '#',
      },
      taxSlipPdf: {
        fileName: 'WorkSphere_TDS_TaxSlip_Jul_2026.pdf',
        fileSize: '95 KB',
        downloadUrl: '#',
      },
    },
    {
      month: 'June 2026',
      monthShort: 'Jun 2026',
      financialYear: 'FY 2026-27',
      payDate: '30 Jun 2026',
      status: 'Paid',
      basicSalary: 45000,
      hra: 22500,
      specialAllowance: 17500,
      conveyance: 4000,
      medicalAllowance: 6000,
      grossEarnings: 95000,
      epfDeduction: 3600,
      professionalTax: 200,
      tdsDeduction: 4200,
      insuranceDeduction: 1600,
      totalDeductions: 9600,
      netSalary: 85400,
      salarySlipPdf: {
        fileName: 'WorkSphere_Payslip_Jun_2026.pdf',
        fileSize: '143 KB',
        downloadUrl: '#',
      },
      taxSlipPdf: {
        fileName: 'WorkSphere_TDS_TaxSlip_Jun_2026.pdf',
        fileSize: '98 KB',
        downloadUrl: '#',
      },
    },
    {
      month: 'May 2026',
      monthShort: 'May 2026',
      financialYear: 'FY 2026-27',
      payDate: '31 May 2026',
      status: 'Paid',
      basicSalary: 45000,
      hra: 22500,
      specialAllowance: 17500,
      conveyance: 4000,
      medicalAllowance: 6000,
      grossEarnings: 95000,
      epfDeduction: 3600,
      professionalTax: 200,
      tdsDeduction: 4200,
      insuranceDeduction: 1600,
      totalDeductions: 9600,
      netSalary: 85400,
      salarySlipPdf: {
        fileName: 'WorkSphere_Payslip_May_2026.pdf',
        fileSize: '140 KB',
        downloadUrl: '#',
      },
      taxSlipPdf: {
        fileName: 'WorkSphere_TDS_TaxSlip_May_2026.pdf',
        fileSize: '96 KB',
        downloadUrl: '#',
      },
    },
    {
      month: 'April 2026',
      monthShort: 'Apr 2026',
      financialYear: 'FY 2026-27',
      payDate: '30 Apr 2026',
      status: 'Paid',
      basicSalary: 45000,
      hra: 22500,
      specialAllowance: 17500,
      conveyance: 4000,
      medicalAllowance: 6000,
      grossEarnings: 95000,
      epfDeduction: 3600,
      professionalTax: 200,
      tdsDeduction: 4200,
      insuranceDeduction: 1600,
      totalDeductions: 9600,
      netSalary: 85400,
      salarySlipPdf: {
        fileName: 'WorkSphere_Payslip_Apr_2026.pdf',
        fileSize: '138 KB',
        downloadUrl: '#',
      },
      taxSlipPdf: {
        fileName: 'WorkSphere_TDS_TaxSlip_Apr_2026.pdf',
        fileSize: '94 KB',
        downloadUrl: '#',
      },
    },

    // FY 2025-26 Records (sample)
    {
      month: 'March 2026',
      monthShort: 'Mar 2026',
      financialYear: 'FY 2025-26',
      payDate: '31 Mar 2026',
      status: 'Paid',
      basicSalary: 42000,
      hra: 21000,
      specialAllowance: 15000,
      conveyance: 4000,
      medicalAllowance: 6000,
      grossEarnings: 88000,
      epfDeduction: 3360,
      professionalTax: 200,
      tdsDeduction: 3800,
      insuranceDeduction: 1500,
      totalDeductions: 8860,
      netSalary: 79140,
      salarySlipPdf: {
        fileName: 'WorkSphere_Payslip_Mar_2026.pdf',
        fileSize: '135 KB',
        downloadUrl: '#',
      },
      taxSlipPdf: {
        fileName: 'WorkSphere_TDS_TaxSlip_Mar_2026.pdf',
        fileSize: '92 KB',
        downloadUrl: '#',
      },
    },
    {
      month: 'February 2026',
      monthShort: 'Feb 2026',
      financialYear: 'FY 2025-26',
      payDate: '28 Feb 2026',
      status: 'Paid',
      basicSalary: 42000,
      hra: 21000,
      specialAllowance: 15000,
      conveyance: 4000,
      medicalAllowance: 6000,
      grossEarnings: 88000,
      epfDeduction: 3360,
      professionalTax: 200,
      tdsDeduction: 3800,
      insuranceDeduction: 1500,
      totalDeductions: 8860,
      netSalary: 79140,
      salarySlipPdf: {
        fileName: 'WorkSphere_Payslip_Feb_2026.pdf',
        fileSize: '136 KB',
        downloadUrl: '#',
      },
      taxSlipPdf: {
        fileName: 'WorkSphere_TDS_TaxSlip_Feb_2026.pdf',
        fileSize: '93 KB',
        downloadUrl: '#',
      },
    },
  ];

  get currentMonthRecord(): MonthlyPayrollRecord {
    return this.monthlyRecords[0]; // October 2026
  }

  get filteredRecords(): MonthlyPayrollRecord[] {
    return this.monthlyRecords.filter((rec) => {
      // Filter by Financial Year
      if (rec.financialYear !== this.selectedFY) {
        return false;
      }
      // Filter by Search Term (month name)
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
    // Recompute YTD stats based on selected FY
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

    // Simulate instant secure PDF document generation and download
    setTimeout(() => {
      this.isDownloading = false;
      this.downloadSuccessMessage = `Downloaded ${docName}`;

      // Create a printable payslip HTML view for downloading/printing
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
    const title = isSalary ? `Salary Payslip - ${record.month}` : `Tax Deduction (TDS) Certificate - ${record.month}`;

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
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
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
            <div style="font-size: 11px; color: #10b981; font-weight: 600;">Status: Verified & Paid</div>
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
          <tr>
            <td class="label">Bank Name</td>
            <td>${this.employeeInfo.bankName}</td>
            <td class="label">Bank A/C No.</td>
            <td>${this.employeeInfo.accountNo}</td>
          </tr>
          <tr>
            <td class="label">PAN Number</td>
            <td>${this.employeeInfo.panNumber}</td>
            <td class="label">UAN / PF No.</td>
            <td>${this.employeeInfo.uanNumber}</td>
          </tr>
        </table>

        <div style="display: flex; gap: 20px;">
          <div style="flex: 1;">
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>EARNINGS</th>
                  <th class="text-right">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Basic Salary</td><td class="text-right">₹${record.basicSalary.toLocaleString('en-IN')}</td></tr>
                <tr><td>House Rent Allowance (HRA)</td><td class="text-right">₹${record.hra.toLocaleString('en-IN')}</td></tr>
                <tr><td>Special Allowance</td><td class="text-right">₹${record.specialAllowance.toLocaleString('en-IN')}</td></tr>
                <tr><td>Conveyance Allowance</td><td class="text-right">₹${record.conveyance.toLocaleString('en-IN')}</td></tr>
                <tr><td>Medical Allowance</td><td class="text-right">₹${record.medicalAllowance.toLocaleString('en-IN')}</td></tr>
                <tr style="font-weight: 700; background: #f8fafc;"><td>Gross Earnings</td><td class="text-right">₹${record.grossEarnings.toLocaleString('en-IN')}</td></tr>
              </tbody>
            </table>
          </div>

          <div style="flex: 1;">
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>DEDUCTIONS</th>
                  <th class="text-right">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Employees Provident Fund (EPF)</td><td class="text-right">₹${record.epfDeduction.toLocaleString('en-IN')}</td></tr>
                <tr><td>Professional Tax (PT)</td><td class="text-right">₹${record.professionalTax.toLocaleString('en-IN')}</td></tr>
                <tr><td>Tax Deducted at Source (TDS)</td><td class="text-right">₹${record.tdsDeduction.toLocaleString('en-IN')}</td></tr>
                <tr><td>Group Health Insurance</td><td class="text-right">₹${record.insuranceDeduction.toLocaleString('en-IN')}</td></tr>
                <tr style="color: transparent;"><td>Placeholder</td><td>-</td></tr>
                <tr style="font-weight: 700; background: #f8fafc;"><td>Total Deductions</td><td class="text-right">₹${record.totalDeductions.toLocaleString('en-IN')}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="net-box">
          <div>
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #065f46; font-weight: 600;">Net Payable Salary</div>
            <div style="font-size: 11px; color: #047857; margin-top: 2px;">Rupees Eighty-Five Thousand Four Hundred Only</div>
          </div>
          <div class="net-val">₹${record.netSalary.toLocaleString('en-IN')}</div>
        </div>

        <div class="footer">
          This is a system-generated document and does not require a physical signature.<br/>
          Work-Sphere Inc. &copy; 2026. Confidential Employee Compensation Document.
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
