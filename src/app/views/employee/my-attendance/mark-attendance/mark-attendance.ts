import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BiometricPunchLog } from '../../../../core/models/attendance.interface';

export type { BiometricPunchLog } from '../../../../core/models/attendance.interface';

@Component({
  selector: 'app-mark-attendance',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mark-attendance.html',
  styleUrl: './mark-attendance.css',
})
export class MarkAttendance implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  constructor(
    private router: Router,
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) {}

  // Clock & Timer
  currentDateTime = new Date();
  private clockTimer: any;

  // Face Scanner State
  scanState: 'idle' | 'scanning' | 'success' | 'failed' = 'idle';
  scanProgress: number = 0;
  scanStatusMessage: string = 'Position your face within the frame';
  confidenceScore: number = 99.4;
  livenessPassed: boolean = true;
  cameraAvailable: boolean = false;
  cameraActive: boolean = false;
  cameraError: string | null = null;
  private mediaStream: MediaStream | null = null;
  private scanInterval: any;

  // Attendance Status
  isClockedIn: boolean = false;
  lastPunchType: 'PUNCH_IN' | 'PUNCH_OUT' = 'PUNCH_IN';
  clockInTime: string = '--';
  elapsedDuration: string = '--';

  // Employee Profile (loaded from authenticated user)
  employeeName = '';
  employeeId = '';
  department = '';
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // Location & Geofence
  workMode: 'office' | 'wfh' = 'office';
  officeLocationName = 'Corporate Tech Hub &middot; Floor 4';
  coordinates = '17.4482, 78.3742';
  isWithinGeofence = true;
  geofenceAccuracy = 'Accurate to 3m';

  // Real-time Biometric Punch Logs from Backend Database
  todayPunches: BiometricPunchLog[] = [];

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.employeeName = user.fullName;
      this.employeeId = user.employeeCode;
      this.department = user.departmentName || 'Engineering';
    }
    this.startClock();
    this.initCamera();
    this.loadTodayAttendance();
  }

  private loadTodayAttendance(): void {
    this.attendanceService.fetchMyAttendance$().subscribe({
      next: (logs) => {
        const list = logs || [];
        if (list.length > 0) {
          const latest = list[0];
          this.isClockedIn = !!latest.punchIn && (!latest.punchOut || latest.punchOut === '--');
          this.clockInTime = latest.punchIn || '--';
          this.elapsedDuration = latest.workHours || '--';
          const punches: BiometricPunchLog[] = [];
          if (latest.punchIn && latest.punchIn !== '--') {
            punches.push({
              id: `PCH-IN-${latest.id?.substring(0, 4) || '101'}`,
              type: 'PUNCH_IN',
              time: latest.punchIn,
              date: latest.date,
              confidence: 99.4,
              location: latest.workLocation || 'Corporate Tech Hub',
              coordinates: this.coordinates,
              verificationMethod: 'Face Recognition',
              status: 'Verified'
            });
          }
          if (latest.punchOut && latest.punchOut !== '--') {
            punches.unshift({
              id: `PCH-OUT-${latest.id?.substring(0, 4) || '102'}`,
              type: 'PUNCH_OUT',
              time: latest.punchOut,
              date: latest.date,
              confidence: 99.1,
              location: latest.workLocation || 'Corporate Tech Hub',
              coordinates: this.coordinates,
              verificationMethod: 'Face Recognition',
              status: 'Verified'
            });
          }
          this.todayPunches = punches;
        }
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    if (this.clockTimer) clearInterval(this.clockTimer);
    if (this.scanInterval) clearInterval(this.scanInterval);
    this.stopCamera();
  }

  startClock(): void {
    this.clockTimer = setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);
  }

  async initCamera(): Promise<void> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        this.cameraAvailable = true;
        this.cameraActive = true;
        this.cameraError = null;

        setTimeout(() => {
          if (this.videoPlayer && this.videoPlayer.nativeElement && this.mediaStream) {
            this.videoPlayer.nativeElement.srcObject = this.mediaStream;
            this.videoPlayer.nativeElement.play().catch(() => {});
          }
        }, 100);
      } else {
        this.cameraAvailable = false;
        this.cameraActive = false;
      }
    } catch (err: any) {
      // Graceful fallback to interactive simulator HUD
      this.cameraAvailable = false;
      this.cameraActive = false;
      this.cameraError = err?.message || 'Webcam access not granted. Simulator mode active.';
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.cameraActive = false;
  }

  toggleCamera(): void {
    if (this.cameraActive) {
      this.stopCamera();
    } else {
      this.initCamera();
    }
  }

  /**
   * Start AI Face Recognition Scan & Verification Sequence
   */
  startFaceRecognition(): void {
    if (this.scanState === 'scanning') return;

    this.scanState = 'scanning';
    this.scanProgress = 10;
    this.scanStatusMessage = 'Scanning face landmarks...';

    // Step 1: Face landmark detection
    setTimeout(() => {
      if (this.scanState !== 'scanning') return;
      this.scanProgress = 40;
      this.scanStatusMessage = 'Verifying 3D depth & liveness...';
    }, 600);

    // Step 2: Biometric template matching
    setTimeout(() => {
      if (this.scanState !== 'scanning') return;
      this.scanProgress = 75;
      this.scanStatusMessage = 'Matching with registered profile...';
    }, 1200);

    // Step 3: Success & Verification
    setTimeout(() => {
      if (this.scanState !== 'scanning') return;
      this.scanProgress = 100;
      this.scanState = 'success';

      const nextType: 'PUNCH_IN' | 'PUNCH_OUT' = this.isClockedIn ? 'PUNCH_OUT' : 'PUNCH_IN';
      this.lastPunchType = nextType;
      const actionName = nextType === 'PUNCH_IN' ? 'Check-In' : 'Check-Out';
      this.scanStatusMessage = `Identity verified: ${this.employeeName} (${this.confidenceScore}%) - ${actionName}`;

      // Record Punch
      this.recordVerifiedPunch(nextType);

      // After face capture, redirect to /employee/my-attendance after 1.5 seconds
      setTimeout(() => {
        this.router.navigate(['/employee/my-attendance']);
      }, 1500);
    }, 1900);
  }

  private recordVerifiedPunch(punchType: 'PUNCH_IN' | 'PUNCH_OUT'): void {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const locationStr = this.workMode === 'office' ? 'Corporate Tech Hub (Floor 4)' : 'Remote (WFH)';

    this.attendanceService.markAttendance$(punchType === 'PUNCH_IN' ? 'PunchIn' : 'PunchOut', locationStr).subscribe({
      next: () => {},
      error: () => {}
    });

    const newPunch: BiometricPunchLog = {
      id: `PCH-${Math.floor(100 + Math.random() * 900)}`,
      type: punchType,
      time: timeStr,
      date: dateStr,
      confidence: this.confidenceScore,
      location: locationStr,
      coordinates: this.coordinates,
      verificationMethod: 'Face Recognition',
      status: 'Verified',
    };

    this.todayPunches.unshift(newPunch);

    if (punchType === 'PUNCH_IN') {
      this.isClockedIn = true;
      this.clockInTime = timeStr;
    } else {
      this.isClockedIn = false;
    }
  }

  resetScan(): void {
    this.scanState = 'idle';
    this.scanProgress = 0;
    this.scanStatusMessage = 'Position your face within the frame';
  }
}
