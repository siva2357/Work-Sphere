import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  applicantsCount: number;
  status: 'Active' | 'Draft' | 'Closed';
  postedDate: string;
  salaryRange: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  jobId: string;
  department: string;
  stage: 'Applied' | 'Screening' | 'Technical' | 'HR Round' | 'Offered' | 'Hired';
  rating: number;
  experience: string;
  email: string;
  phone: string;
  appliedDate: string;
  avatar: string;
  matchScore: number;
}

@Component({
  selector: 'app-recruitment-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruitment-management.html',
  styleUrl: './recruitment-management.css',
})
export class RecruitmentManagement implements OnInit {
  activeTab: 'jobs' | 'pipeline' = 'jobs';
  searchTerm = '';
  selectedDept = 'All';
  selectedStage = 'All';

  // Modals
  showCreateJobModal = false;
  showCandidateModal = false;
  selectedCandidate: Candidate | null = null;

  // New Job Form Model
  newJob = {
    title: '',
    department: 'Engineering',
    location: 'Bangalore, India (Hybrid)',
    type: 'Full-time',
    experience: '3-5 Years',
    salaryRange: '$80,000 - $110,000',
    description: ''
  };

  jobs: JobOpening[] = [
    {
      id: 'JOB-201',
      title: 'Senior Frontend Engineer (Angular)',
      department: 'Engineering',
      location: 'Bangalore (Hybrid)',
      type: 'Full-time',
      experience: '4-7 Years',
      applicantsCount: 38,
      status: 'Active',
      postedDate: 'Oct 14, 2026',
      salaryRange: '$90k - $120k'
    },
    {
      id: 'JOB-202',
      title: 'Cloud DevOps Architect',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '5-8 Years',
      applicantsCount: 24,
      status: 'Active',
      postedDate: 'Oct 18, 2026',
      salaryRange: '$110k - $140k'
    },
    {
      id: 'JOB-203',
      title: 'Lead Product Designer (UI/UX)',
      department: 'Product & Design',
      location: 'Bangalore (In-Office)',
      type: 'Full-time',
      experience: '4-6 Years',
      applicantsCount: 19,
      status: 'Active',
      postedDate: 'Oct 20, 2026',
      salaryRange: '$85k - $105k'
    },
    {
      id: 'JOB-204',
      title: 'Enterprise Account Executive',
      department: 'Sales',
      location: 'Mumbai (Field)',
      type: 'Full-time',
      experience: '3-5 Years',
      applicantsCount: 27,
      status: 'Active',
      postedDate: 'Oct 08, 2026',
      salaryRange: '$75k - $95k + Commission'
    },
    {
      id: 'JOB-205',
      title: 'AI / ML Research Engineer',
      department: 'Engineering',
      location: 'Bangalore (Hybrid)',
      type: 'Full-time',
      experience: '2-5 Years',
      applicantsCount: 31,
      status: 'Active',
      postedDate: 'Oct 22, 2026',
      salaryRange: '$100k - $130k'
    },
    {
      id: 'JOB-206',
      title: 'Senior Technical Recruiter',
      department: 'Human Resources',
      location: 'Bangalore (Hybrid)',
      type: 'Full-time',
      experience: '3-6 Years',
      applicantsCount: 14,
      status: 'Draft',
      postedDate: 'Oct 24, 2026',
      salaryRange: '$60k - $80k'
    }
  ];

  candidates: Candidate[] = [
    {
      id: 'CAND-01',
      name: 'Aarav Patel',
      role: 'Senior Frontend Engineer',
      jobId: 'JOB-201',
      department: 'Engineering',
      stage: 'Technical',
      rating: 4.8,
      experience: '5.5 Years',
      email: 'aarav.patel@example.com',
      phone: '+91 98765 43210',
      appliedDate: 'Oct 19, 2026',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      matchScore: 94
    },
    {
      id: 'CAND-02',
      name: 'Diya Sen',
      role: 'Lead Product Designer',
      jobId: 'JOB-203',
      department: 'Product & Design',
      stage: 'HR Round',
      rating: 4.9,
      experience: '6 Years',
      email: 'diya.sen@example.com',
      phone: '+91 98765 12345',
      appliedDate: 'Oct 21, 2026',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      matchScore: 96
    },
    {
      id: 'CAND-03',
      name: 'Vikram Malhotra',
      role: 'Cloud DevOps Architect',
      jobId: 'JOB-202',
      department: 'Engineering',
      stage: 'Offered',
      rating: 4.7,
      experience: '7 Years',
      email: 'vikram.m@example.com',
      phone: '+91 98234 56789',
      appliedDate: 'Oct 15, 2026',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      matchScore: 91
    },
    {
      id: 'CAND-04',
      name: 'Neha Chawla',
      role: 'Enterprise Account Executive',
      jobId: 'JOB-204',
      department: 'Sales',
      stage: 'Screening',
      rating: 4.3,
      experience: '3.5 Years',
      email: 'neha.chawla@example.com',
      phone: '+91 97123 45678',
      appliedDate: 'Oct 23, 2026',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      matchScore: 85
    },
    {
      id: 'CAND-05',
      name: 'Rohan Mehra',
      role: 'AI / ML Research Engineer',
      jobId: 'JOB-205',
      department: 'Engineering',
      stage: 'Applied',
      rating: 4.5,
      experience: '4 Years',
      email: 'rohan.mehra@example.com',
      phone: '+91 99887 76655',
      appliedDate: 'Oct 25, 2026',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      matchScore: 89
    },
    {
      id: 'CAND-06',
      name: 'Ananya Roy',
      role: 'Senior Frontend Engineer',
      jobId: 'JOB-201',
      department: 'Engineering',
      stage: 'Technical',
      rating: 4.6,
      experience: '5 Years',
      email: 'ananya.roy@example.com',
      phone: '+91 98451 23678',
      appliedDate: 'Oct 20, 2026',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      matchScore: 92
    }
  ];

  stagesList: ('Applied' | 'Screening' | 'Technical' | 'HR Round' | 'Offered' | 'Hired')[] = [
    'Applied',
    'Screening',
    'Technical',
    'HR Round',
    'Offered',
    'Hired'
  ];

  ngOnInit(): void {}

  get filteredJobs(): JobOpening[] {
    return this.jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            job.department.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept = this.selectedDept === 'All' || job.department === this.selectedDept;
      return matchesSearch && matchesDept;
    });
  }

  get filteredCandidates(): Candidate[] {
    return this.candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            c.role.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept = this.selectedDept === 'All' || c.department === this.selectedDept;
      const matchesStage = this.selectedStage === 'All' || c.stage === this.selectedStage;
      return matchesSearch && matchesDept && matchesStage;
    });
  }

  getCandidatesByStage(stage: string): Candidate[] {
    return this.filteredCandidates.filter(c => c.stage === stage);
  }

  openCandidateDetails(candidate: Candidate) {
    this.selectedCandidate = candidate;
    this.showCandidateModal = true;
  }

  closeCandidateModal() {
    this.showCandidateModal = false;
    this.selectedCandidate = null;
  }

  moveCandidateStage(candidate: Candidate, newStage: any) {
    candidate.stage = newStage;
  }

  openCreateJob() {
    this.showCreateJobModal = true;
  }

  closeCreateJob() {
    this.showCreateJobModal = false;
  }

  submitJob() {
    if (!this.newJob.title) return;
    const newOpening: JobOpening = {
      id: `JOB-${200 + this.jobs.length + 1}`,
      title: this.newJob.title,
      department: this.newJob.department,
      location: this.newJob.location,
      type: this.newJob.type,
      experience: this.newJob.experience,
      applicantsCount: 0,
      status: 'Active',
      postedDate: 'Just now',
      salaryRange: this.newJob.salaryRange
    };
    this.jobs.unshift(newOpening);
    this.closeCreateJob();
  }
}
