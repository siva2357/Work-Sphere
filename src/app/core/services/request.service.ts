import { Injectable } from '@angular/core';

export interface ApprovalLevel {
  levelNumber: number;
  levelTitle: string; // 'Level 1: Team Lead', 'Level 2: Engineering Manager', etc.
  role: string;
  approverName: string;
  approverId?: string; // e.g. '#P11210'
  avatarColor: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  actionDate?: string;
  remarks?: string;
  isCurrent: boolean;
  isFinalHR: boolean;
}

export interface ManagedRequest {
  id: string; // 'REQ-2026-104'
  employeeId: string; // 'EMP-0172'
  employeeName: string;
  employeeEmail: string;
  employeeRole: string;
  department: string;
  location: string;
  avatarColor: string;

  category:
    | 'Hardware / Asset'
    | 'IT & System Access'
    | 'Promotion Request'
    | 'Appraisal & Salary Review'
    | 'Department Transfer'
    | 'Resignation Request'
    | 'Work From Home'
    | 'Expense Reimbursement';

  subject: string;
  description: string;
  submittedDate: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  overallStatus: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';

  currentLevelNumber: number;
  totalLevels: number;
  approvalChain: ApprovalLevel[];
  attachments?: { name: string; size: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly STORAGE_KEY = 'worksphere_managed_requests_v3';

  private readonly defaultRequests: ManagedRequest[] = [
    {
      id: 'REQ-2026-112',
      employeeId: 'EMP-0180',
      employeeName: 'Dr. Evelyn Reed',
      employeeEmail: 'evelyn.reed@worksphere.io',
      employeeRole: 'Staff Principal AI Architect',
      department: 'AI & Machine Learning',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#10b981',
      category: 'Promotion Request',
      subject: 'Distinguished Fellow Promotion & Cross-Org AI Governance Lead',
      description: 'Formal elevation petition backed by 4 approved enterprise AI patents, architecting the Work-Sphere zero-trust LLM safety gateway, and direct technical mentorship across 12 feature squads.',
      submittedDate: '24 Oct 2026',
      priority: 'Urgent',
      overallStatus: 'Under Review',
      currentLevelNumber: 3,
      totalLevels: 5,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Level 1: Team Lead Review',
          role: 'AI Tech Lead',
          approverName: 'Priya Patel',
          avatarColor: '#10b981',
          status: 'Approved',
          actionDate: '24 Oct 2026, 11:30 AM',
          remarks: 'Exceptional architectural contributions. Highest technical merit endorsed.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Level 2: Engineering Manager',
          role: 'Platform Delivery Manager',
          approverName: 'David Chen',
          avatarColor: '#0ea5e9',
          status: 'Approved',
          actionDate: '25 Oct 2026, 09:15 AM',
          remarks: 'Benchmarking confirmed against staff principal salary and equity band.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'Level 3: Department Director',
          role: 'Director of AI Systems',
          approverName: 'Deepak Sharma',
          avatarColor: '#6366f1',
          status: 'Pending',
          isCurrent: true,
          isFinalHR: false,
        },
        {
          levelNumber: 4,
          levelTitle: 'Level 4: VP of Technology',
          role: 'Vice President of Technology',
          approverName: 'Dr. Aris Thorne',
          avatarColor: '#8b5cf6',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 5,
          levelTitle: 'Final Level: HR Operations & Executive Board',
          role: 'Chief People Officer & HR Head',
          approverName: 'Sarah Jenkins (HR Head)',
          avatarColor: '#ec4899',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
      attachments: [
        { name: 'Principal_Architect_Charter_v3.pdf', size: '4.2 MB' },
        { name: 'Executive_Sponsorship_Letters.pdf', size: '2.1 MB' },
      ],
    },
    {
      id: 'REQ-2026-104',
      employeeId: 'EMP-0172',
      employeeName: 'Maya Lin',
      employeeEmail: 'maya.lin@worksphere.io',
      employeeRole: 'Senior Angular Engineer',
      department: 'Core Web Platform',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#10b981',
      category: 'Hardware / Asset',
      subject: 'External 4K Monitor & USB-C Multiport Docking Station',
      description: 'Requesting a secondary 27-inch 4K high-density display and Thunderbolt dock for frontend microservice development, responsive breakpoint QA, and UI design token review.',
      submittedDate: '21 Oct 2026',
      priority: 'High',
      overallStatus: 'Under Review',
      currentLevelNumber: 2,
      totalLevels: 4,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Level 1: Team Lead Review',
          role: 'Frontend Engineering Lead',
          approverName: 'Priya Patel',
          avatarColor: '#10b981',
          status: 'Approved',
          actionDate: '22 Oct 2026, 10:15 AM',
          remarks: 'Hardware specification verified. Essential for UI component testing.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Level 2: Engineering Manager',
          role: 'Platform Delivery Manager',
          approverName: 'David Chen',
          avatarColor: '#0ea5e9',
          status: 'Pending',
          isCurrent: true,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'Level 3: IT Hardware Lead',
          role: 'Infrastructure Asset Director',
          approverName: 'Marcus Vance',
          avatarColor: '#f59e0b',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 4,
          levelTitle: 'Final Level: HR & Asset Operations',
          role: 'People Operations & Facilities',
          approverName: 'Sarah Jenkins (HR Head)',
          avatarColor: '#ec4899',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
      attachments: [
        { name: 'Hardware_Specification_Form_v2.pdf', size: '1.2 MB' },
        { name: 'Desk_Setup_Layout.png', size: '850 KB' },
      ],
    },
    {
      id: 'REQ-2026-098',
      employeeId: 'EMP-0175',
      employeeName: 'Samuel Kim',
      employeeEmail: 'samuel.kim@worksphere.io',
      employeeRole: 'Full Stack Java Engineer',
      department: 'Platform Services',
      location: 'Austin, TX',
      avatarColor: '#f59e0b',
      category: 'Promotion Request',
      subject: 'Progression from Senior Engineer to Lead Backend Architect',
      description: 'Formal elevation request backed by key achievements: led transactional payroll engine redesign, reduced API latency by 45%, and mentored 3 junior contributors during H1 sprint cycles.',
      submittedDate: '19 Oct 2026',
      priority: 'High',
      overallStatus: 'Under Review',
      currentLevelNumber: 3,
      totalLevels: 4,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Level 1: Team Lead Review',
          role: 'Platform Services Lead',
          approverName: 'Rohan Sharma',
          avatarColor: '#f59e0b',
          status: 'Approved',
          actionDate: '20 Oct 2026, 02:30 PM',
          remarks: 'Strong technical ownership demonstrated. Fully endorse promotion.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Level 2: Engineering Manager',
          role: 'Director of Platform Engineering',
          approverName: 'Deepak Sharma',
          avatarColor: '#6366f1',
          status: 'Approved',
          actionDate: '23 Oct 2026, 11:00 AM',
          remarks: 'Performance criteria met. Benchmarking against staff band.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'Level 3: VP of Engineering',
          role: 'Vice President of Technology',
          approverName: 'Dr. Aris Thorne',
          avatarColor: '#8b5cf6',
          status: 'Pending',
          isCurrent: true,
          isFinalHR: false,
        },
        {
          levelNumber: 4,
          levelTitle: 'Final Level: HR Compensation & Talent',
          role: 'Chief People Officer',
          approverName: 'Sarah Jenkins (HR Head)',
          avatarColor: '#ec4899',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
      attachments: [
        { name: 'H1_Deliverables_Impact_Deck.pdf', size: '3.4 MB' },
        { name: 'Peer_Recommendation_Letters.pdf', size: '1.8 MB' },
      ],
    },
    {
      id: 'REQ-2026-085',
      employeeId: 'EMP-0174',
      employeeName: 'Elena Rostova',
      employeeEmail: 'elena.rostova@worksphere.io',
      employeeRole: 'DevOps & SRE Specialist',
      department: 'IT & Technology Platform',
      location: 'Seattle, WA',
      avatarColor: '#0ea5e9',
      category: 'IT & System Access',
      subject: 'Production Kubernetes Cluster & Vault Secrets Access',
      description: 'Elevated role-based zero-trust credentials required for resolving deployment bottlenecks and maintaining multi-region cluster reliability during scheduled outages.',
      submittedDate: '10 Oct 2026',
      priority: 'Urgent',
      overallStatus: 'Approved',
      currentLevelNumber: 3,
      totalLevels: 3,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Level 1: Team Lead Review',
          role: 'Database & Infra Lead',
          approverName: 'David Chen',
          avatarColor: '#0ea5e9',
          status: 'Approved',
          actionDate: '10 Oct 2026, 11:00 AM',
          remarks: 'Directly verified SRE assignment.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Level 2: Security & IAM Lead',
          role: 'Cloud Security Architect',
          approverName: 'Sneha Reddy',
          avatarColor: '#14b8a6',
          status: 'Approved',
          actionDate: '10 Oct 2026, 01:20 PM',
          remarks: 'MFA zero-trust policy enforced.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'Final Level: HR & Compliance Access Sign-Off',
          role: 'Head of Compliance & HR',
          approverName: 'Sarah Jenkins (HR Head)',
          avatarColor: '#ec4899',
          status: 'Approved',
          actionDate: '10 Oct 2026, 04:45 PM',
          remarks: 'SOC2 operational compliance cleared.',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
    },
    {
      id: 'REQ-2026-072',
      employeeId: 'EMP-0173',
      employeeName: 'Carlos Rivera',
      employeeEmail: 'carlos.rivera@worksphere.io',
      employeeRole: 'Senior Product Designer',
      department: 'Product Design',
      location: 'New York, NY',
      avatarColor: '#8b5cf6',
      category: 'Department Transfer',
      subject: 'Horizontal Squad Transfer to Core Architecture Design System',
      description: 'Requesting transfer from Feature Experience Pod to Global Design System Architecture Pod to focus on cross-platform design tokens and accessibility guidelines.',
      submittedDate: '03 Oct 2026',
      priority: 'Medium',
      overallStatus: 'Approved',
      currentLevelNumber: 3,
      totalLevels: 3,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Level 1: Releasing Lead',
          role: 'Design System Lead',
          approverName: 'Alex Rivera',
          avatarColor: '#8b5cf6',
          status: 'Approved',
          actionDate: '04 Oct 2026',
          remarks: 'Handover plan confirmed.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Level 2: Receiving Manager',
          role: 'VP Product Design',
          approverName: 'Elena Vance',
          avatarColor: '#10b981',
          status: 'Approved',
          actionDate: '06 Oct 2026',
          remarks: 'Headcount slot open in Q4.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'Final Level: HR Talent Operations',
          role: 'Head of People Operations',
          approverName: 'Sarah Jenkins (HR Head)',
          avatarColor: '#ec4899',
          status: 'Approved',
          actionDate: '08 Oct 2026',
          remarks: 'Transfer contract executed.',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
    },
    {
      id: 'REQ-2026-061',
      employeeId: 'EMP-0176',
      employeeName: 'Aisha Bello',
      employeeEmail: 'aisha.bello@worksphere.io',
      employeeRole: 'Lead Automation QA Engineer',
      department: 'Quality Assurance',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#ec4899',
      category: 'Appraisal & Salary Review',
      subject: 'Mid-Year Compensation Revision & Market Equity Adjustment',
      description: 'Formal review request based on expanded responsibilities including leading CI/CD test automation across 6 squads and maintaining 99.8% regression pass rate.',
      submittedDate: '26 Sep 2026',
      priority: 'High',
      overallStatus: 'Pending',
      currentLevelNumber: 1,
      totalLevels: 4,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Level 1: QA Lead Review',
          role: 'Staff Quality Architect',
          approverName: 'Neha Sharma',
          avatarColor: '#ec4899',
          status: 'Pending',
          isCurrent: true,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Level 2: Department Director',
          role: 'Director of Engineering',
          approverName: 'David Chen',
          avatarColor: '#0ea5e9',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'Level 3: VP of Operations',
          role: 'VP Technology',
          approverName: 'Dr. Aris Thorne',
          avatarColor: '#8b5cf6',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 4,
          levelTitle: 'Final Level: HR Compensation Committee',
          role: 'Director of Total Rewards',
          approverName: 'Sarah Jenkins (HR Head)',
          avatarColor: '#ec4899',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
    },
    {
      id: 'REQ-2026-049',
      employeeId: 'EMP-0177',
      employeeName: 'Kevin Zhao',
      employeeEmail: 'kevin.zhao@worksphere.io',
      employeeRole: 'Cross-Platform Mobile Developer',
      department: 'Mobile Engineering',
      location: 'Chicago, IL',
      avatarColor: '#6366f1',
      category: 'Work From Home',
      subject: 'Transition to Hybrid Remote Work Schedule (3 Days Remote)',
      description: 'Requesting adjustment of working schedule to 3 days remote and 2 days on-site to accommodate family care while maintaining full core sprint overlap hours.',
      submittedDate: '14 Sep 2026',
      priority: 'Medium',
      overallStatus: 'Approved',
      currentLevelNumber: 2,
      totalLevels: 2,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Level 1: Mobile Lead Review',
          role: 'Mobile Engineering Lead',
          approverName: 'Vikram Malhotra',
          avatarColor: '#6366f1',
          status: 'Approved',
          actionDate: '15 Sep 2026',
          remarks: 'Core team sprint velocity will remain unaffected.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Final Level: HR People Partner Sign-Off',
          role: 'HR Business Partner',
          approverName: 'Sarah Jenkins (HR Head)',
          avatarColor: '#ec4899',
          status: 'Approved',
          actionDate: '16 Sep 2026',
          remarks: 'Hybrid remote agreement signed.',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
    },
    {
      id: 'REQ-2026-033',
      employeeId: 'EMP-0178',
      employeeName: 'Arjun Mehta',
      employeeEmail: 'arjun.mehta@worksphere.io',
      employeeRole: 'AI & Machine Learning Engineer',
      department: 'IT & Technology Platform',
      location: 'Boston, MA',
      avatarColor: '#14b8a6',
      category: 'Expense Reimbursement',
      subject: 'Annual AI & Cloud Summit Registration Fee Reimbursement',
      description: 'Submission of receipts and conference certification for PyTorch Enterprise Developer Summit 2026 ($650.00) under annual employee upskilling allowance.',
      submittedDate: '22 Aug 2026',
      priority: 'Low',
      overallStatus: 'Approved',
      currentLevelNumber: 3,
      totalLevels: 3,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Level 1: Technical Lead',
          role: 'AI Tech Lead',
          approverName: 'Priya Patel',
          avatarColor: '#10b981',
          status: 'Approved',
          actionDate: '23 Aug 2026',
          remarks: 'Verified certificate of attendance.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Level 2: Finance & Budget Lead',
          role: 'Finance Controller',
          approverName: 'Karthik Rao',
          avatarColor: '#f59e0b',
          status: 'Approved',
          actionDate: '24 Aug 2026',
          remarks: 'Within quarterly learning budget.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'Final Level: HR Operations & Payroll Sign-off',
          role: 'Head of People Operations',
          approverName: 'Sarah Jenkins (HR Head)',
          avatarColor: '#ec4899',
          status: 'Approved',
          actionDate: '25 Aug 2026',
          remarks: 'Disbursement scheduled in next payroll cycle.',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
    },
    {
      id: 'REQ-2026-018',
      employeeId: 'EMP-0142',
      employeeName: 'Rohan Sharma',
      employeeEmail: 'rohan.sharma@worksphere.io',
      employeeRole: 'Full Stack Java Engineer',
      department: 'Platform Services',
      location: 'Austin, TX',
      avatarColor: '#f59e0b',
      category: 'Resignation Request',
      subject: 'Formal Separation Notice & Handover Timeline',
      description: 'Submitting formal resignation letter with 30-day notice period to pursue higher academic studies. Knowledge transfer documentation will be finalized with team lead.',
      submittedDate: '05 Aug 2026',
      priority: 'Urgent',
      overallStatus: 'Rejected',
      currentLevelNumber: 2,
      totalLevels: 3,
      approvalChain: [
        {
          levelNumber: 1,
          levelTitle: 'Level 1: Direct Manager Retention Meeting',
          role: 'Platform Services Lead',
          approverName: 'David Chen',
          avatarColor: '#0ea5e9',
          status: 'Approved',
          actionDate: '06 Aug 2026',
          remarks: 'Exit interview conducted. Retention counter-offer presented.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 2,
          levelTitle: 'Level 2: Engineering Director Review',
          role: 'Director of Technology',
          approverName: 'Dr. Aris Thorne',
          avatarColor: '#8b5cf6',
          status: 'Rejected',
          actionDate: '08 Aug 2026',
          remarks: 'Employee accepted retention sabbatical sponsorship; resignation withdrawn.',
          isCurrent: false,
          isFinalHR: false,
        },
        {
          levelNumber: 3,
          levelTitle: 'Final Level: HR Offboarding Clearance',
          role: 'Head of People Operations',
          approverName: 'Sarah Jenkins (HR Head)',
          avatarColor: '#ec4899',
          status: 'Pending',
          isCurrent: false,
          isFinalHR: true,
        },
      ],
    },
  ];

  private requests: ManagedRequest[] = [];

  constructor() {
    this.loadRequests();
  }

  private loadRequests(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          this.requests = JSON.parse(stored);
          return;
        } catch {}
      }
    }
    this.requests = [...this.defaultRequests];
    this.saveRequests();
  }

  private saveRequests(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.requests));
      } catch (err) {
        console.error('Failed to save requests', err);
      }
    }
  }

  getRequests(): ManagedRequest[] {
    return [...this.requests];
  }

  getRequestById(id: string): ManagedRequest | undefined {
    return this.requests.find((r) => r.id === id) || this.requests[0];
  }

  // Manager / HR Approves at the Current Level
  approveCurrentLevel(requestId: string, remarks?: string): { success: boolean; isFinal: boolean; message: string } {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return { success: false, isFinal: false, message: 'Request not found' };

    const currentLevel = req.approvalChain.find((l) => l.isCurrent);
    if (!currentLevel) {
      return { success: false, isFinal: false, message: 'No pending level to approve' };
    }

    const nowStr = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    currentLevel.status = 'Approved';
    currentLevel.actionDate = nowStr;
    if (remarks) currentLevel.remarks = remarks;
    currentLevel.isCurrent = false;

    // Check if this was the final level (HR)
    if (currentLevel.isFinalHR || req.currentLevelNumber >= req.totalLevels) {
      req.overallStatus = 'Approved';
      this.saveRequests();
      return {
        success: true,
        isFinal: true,
        message: `Final HR sign-off completed for ${req.id}! Request is now fully approved.`,
      };
    } else {
      // Advance to the next level in hierarchy
      req.currentLevelNumber++;
      const nextLevel = req.approvalChain.find((l) => l.levelNumber === req.currentLevelNumber);
      if (nextLevel) {
        nextLevel.isCurrent = true;
      }
      req.overallStatus = 'Under Review';
      this.saveRequests();
      return {
        success: true,
        isFinal: false,
        message: `Approved at ${currentLevel.levelTitle}. Forwarded to ${nextLevel?.levelTitle || 'next level'}.`,
      };
    }
  }

  // Manager / HR Rejects at Current Level
  rejectCurrentLevel(requestId: string, remarks?: string): boolean {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return false;

    const currentLevel = req.approvalChain.find((l) => l.isCurrent);
    if (currentLevel) {
      const nowStr = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      currentLevel.status = 'Rejected';
      currentLevel.actionDate = nowStr;
      currentLevel.remarks = remarks || 'Declined during review stage.';
      currentLevel.isCurrent = false;
    }

    req.overallStatus = 'Rejected';
    this.saveRequests();
    return true;
  }
}
