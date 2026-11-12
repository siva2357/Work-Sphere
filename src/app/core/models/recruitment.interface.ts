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

export interface ExternalCandidateApplyPayload {
  jobCode: string;
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  resumeUrl?: string;
}

export interface EvaluateCandidatePhasePayload {
  phaseNumber: number;
  passed: boolean;
  score?: number;
  rating?: number;
  feedback?: string;
  offeredCtc?: string;
}

export interface OnboardCandidatePayload {
  workEmail: string;
  temporaryPassword?: string;
  reportingManagerEmployeeId?: string;
}

