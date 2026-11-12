import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { Candidate, JobOpening } from '../../../core/models/recruitment.interface';

export type { Candidate, JobOpening };

@Component({
  selector: 'app-recruitment-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruitment-management.html',
  styleUrl: './recruitment-management.css',
})
export class RecruitmentManagement implements OnInit {
  private recruitmentService = inject(RecruitmentService);
  activeTab: 'jobs' | 'pipeline' = 'jobs';
  searchTerm = '';
  selectedDept = 'All';
  selectedStage = 'All';

  showCreateJobModal = false;
  showCandidateModal = false;
  selectedCandidate: Candidate | null = null;

  newJob = {
    title: '',
    department: 'Engineering',
    location: 'Bangalore, India (Hybrid)',
    type: 'Full-time',
    experience: '3-5 Years',
    salaryRange: '$80,000 - $110,000',
    description: '',
  };

  jobs: JobOpening[] = [];
  candidates: Candidate[] = [];

  stagesList: Candidate['stage'][] = [
    'Applied',
    'Screening',
    'Technical',
    'HR Round',
    'Offered',
    'Hired',
  ];

  ngOnInit(): void {
    this.loadRecruitmentFromBackend();
  }

  loadRecruitmentFromBackend(): void {
    this.recruitmentService.getJobOpenings$().subscribe((backendJobs) => {
      if (Array.isArray(backendJobs)) {
        this.jobs = backendJobs.map((j) => ({
          id: j.jobCode || j.id,
          title: j.title,
          department: j.department || 'Engineering',
          location: j.location || 'Bangalore (Hybrid)',
          type: j.employmentType || 'Full-time',
          experience: j.experienceRange || '3-5 Years',
          applicantsCount: Number(j.applicantsCount || 0),
          status: (j.status as JobOpening['status']) || 'Active',
          postedDate: j.postedDate || 'Synced from Career Portal',
          salaryRange: j.salaryRange || '$85k - $115k',
        }));
      }
    });

    this.recruitmentService.getCandidates$().subscribe((backendCandidates) => {
      if (Array.isArray(backendCandidates)) {
        const stageMap: Record<string, Candidate['stage']> = {
          Phase1_Assessment: 'Screening',
          Phase2_TechnicalRound: 'Technical',
          Phase3_OnlineInterview: 'HR Round',
          Phase4_OfferRelease: 'Offered',
          Onboarding: 'Offered',
          Hired: 'Hired',
        };
        this.candidates = backendCandidates.map((c) => ({
          id: c.candidateCode || c.id,
          name: c.fullName,
          role: c.jobTitle || 'Full Stack Developer',
          jobId: c.jobCode || 'JOB-201',
          department: c.department || 'Engineering',
          stage: stageMap[c.currentPhase] || 'Screening',
          rating: Number(c.overallRating || 4.7),
          experience: c.experience || '4 Years',
          email: c.email,
          phone: c.phone || '+91 98765 43210',
          appliedDate: c.appliedDate || 'Recent',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          matchScore: Number(c.matchScore || 92),
        }));
      }
    });
  }

  get filteredJobs(): JobOpening[] {
    return this.jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept =
        this.selectedDept === 'All' || job.department === this.selectedDept;
      return matchesSearch && matchesDept;
    });
  }

  get filteredCandidates(): Candidate[] {
    return this.candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept =
        this.selectedDept === 'All' || c.department === this.selectedDept;
      const matchesStage =
        this.selectedStage === 'All' || c.stage === this.selectedStage;
      return matchesSearch && matchesDept && matchesStage;
    });
  }

  getCandidatesByStage(stage: string): Candidate[] {
    return this.filteredCandidates.filter((c) => c.stage === stage);
  }

  openCandidateDetails(candidate: Candidate): void {
    this.selectedCandidate = candidate;
    this.showCandidateModal = true;
  }

  closeCandidateModal(): void {
    this.showCandidateModal = false;
    this.selectedCandidate = null;
  }

  moveCandidateStage(candidate: Candidate, newStage: Candidate['stage']): void {
    candidate.stage = newStage;
  }

  openCreateJob(): void {
    this.showCreateJobModal = true;
  }

  closeCreateJob(): void {
    this.showCreateJobModal = false;
  }

  submitJob(): void {
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
      salaryRange: this.newJob.salaryRange,
    };
    this.jobs.unshift(newOpening);
    this.closeCreateJob();
  }
}
