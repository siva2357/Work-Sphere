import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  EvaluateCandidatePhasePayload,
  ExternalCandidateApplyPayload,
  OnboardCandidatePayload,
} from '../models/recruitment.interface';

@Injectable({
  providedIn: 'root',
})
export class RecruitmentService {
  private readonly http = inject(HttpClient);

  /**
   * Fetches the 4-Phase Recruitment & Onboarding matrix overview (GET /api/recruitment/workflow-overview).
   */
  getWorkflowOverview$(): Observable<any[]> {
    return this.http
      .get<any[]>(API_ENDPOINTS.RECRUITMENT.WORKFLOW_OVERVIEW)
      .pipe(catchError(() => of([])));
  }

  /**
   * Fetches all Job Openings synced with the external career website (GET /api/recruitment/jobs).
   */
  getJobOpenings$(): Observable<any[]> {
    return this.http
      .get<any[]>(API_ENDPOINTS.RECRUITMENT.JOBS)
      .pipe(catchError(() => of([])));
  }

  /**
   * Fetches all Candidates & their 4-Phase Funnel Evaluations (GET /api/recruitment/candidates).
   */
  getCandidates$(): Observable<any[]> {
    return this.http
      .get<any[]>(API_ENDPOINTS.RECRUITMENT.CANDIDATES)
      .pipe(catchError(() => of([])));
  }

  /**
   * Submits an application from the external career website (POST /api/recruitment/external/apply).
   */
  applyExternalCandidate$(payload: ExternalCandidateApplyPayload): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.RECRUITMENT.EXTERNAL_APPLY, payload);
  }

  /**
   * Evaluates a candidate's current phase (1: Assessment, 2: Technical, 3: Online Interview, 4: Offer Release)
   * (POST /api/recruitment/candidates/{candidateId}/evaluate-phase).
   */
  evaluateCandidatePhase$(
    candidateId: string,
    payload: EvaluateCandidatePhasePayload
  ): Observable<any> {
    return this.http.post<any>(
      API_ENDPOINTS.RECRUITMENT.EVALUATE_PHASE(candidateId),
      payload
    );
  }

  /**
   * Final Onboarding Step: Converts an accepted candidate into an official Employee in PostgreSQL
   * (POST /api/recruitment/candidates/{candidateId}/onboard).
   */
  onboardCandidateAsEmployee$(
    candidateId: string,
    payload: OnboardCandidatePayload
  ): Observable<any> {
    return this.http.post<any>(
      API_ENDPOINTS.RECRUITMENT.ONBOARD_CANDIDATE(candidateId),
      {
        workEmail: payload.workEmail,
        temporaryPassword: payload.temporaryPassword || 'Welcome@12345',
        reportingManagerEmployeeId: payload.reportingManagerEmployeeId,
      }
    );
  }
}
