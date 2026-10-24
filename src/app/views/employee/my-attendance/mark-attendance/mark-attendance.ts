import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface BiometricPunchLog {
  id: string;
  type: 'PUNCH_IN' | 'PUNCH_OUT';
  time: string;
  date: string;
  confidence: number;
  location: string;
  coordinates: string;
  verificationMethod: 'Face Recognition' | 'Biometric AI';
  status: 'Verified' | 'Pending';
}

@Component({
  selector: 'app-mark-attendance',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mark-attendance.html',
  styleUrl: './mark-attendance.css',
})
export class MarkAttendance implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  constructor(private router: Router) {}

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
  isClockedIn: boolean = true;
  lastPunchType: 'PUNCH_IN' | 'PUNCH_OUT' = 'PUNCH_IN';
  clockInTime: string = '09:15 AM';
  elapsedDuration: string = '4h 38m';

  // Employee Profile
  employeeName = 'Siva Prasad';
  employeeId = 'EMP-1042';
  department = 'IT Department';
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // Location & Geofence
  workMode: 'office' | 'wfh' = 'office';
  officeLocationName = 'Hyderabad Tech Hub &middot; Floor 4';
  coordinates = '17.4482, 78.3742';
  isWithinGeofence = true;
  geofenceAccuracy = 'Accurate to 3m';

  // Recent Biometric Punch Logs
  todayPunches: BiometricPunchLog[] = [
    {
      id: 'PCH-901',
      type: 'PUNCH_IN',
      time: '09:15 AM',
      date: '24 Oct 2026',
      confidence: 99.4,
      location: 'Hyderabad Tech Hub (Floor 4)',
      coordinates: '17.4482, 78.3742',
      verificationMethod: 'Face Recognition',
      status: 'Verified',
    },
    {
      id: 'PCH-902',
      type: 'PUNCH_OUT',
      time: '01:05 PM',
      date: '24 Oct 2026',
      confidence: 98.8,
      location: 'Hyderabad Tech Hub (Cafeteria)',
      coordinates: '17.4482, 78.3742',
      verificationMethod: 'Face Recognition',
      status: 'Verified',
    },
    {
      id: 'PCH-903',
      type: 'PUNCH_IN',
      time: '01:55 PM',
      date: '24 Oct 2026',
      confidence: 99.1,
      location: 'Hyderabad Tech Hub (Floor 4)',
      coordinates: '17.4482, 78.3742',
      verificationMethod: 'Face Recognition',
      status: 'Verified',
    },
  ];

  ngOnInit(): void {
    this.startClock();
    this.initCamera();
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
    const dateStr = '24 Oct 2026';

    const newPunch: BiometricPunchLog = {
      id: `PCH-${Math.floor(100 + Math.random() * 900)}`,
      type: punchType,
      time: timeStr,
      date: dateStr,
      confidence: this.confidenceScore,
      location: this.workMode === 'office' ? 'Hyderabad Tech Hub (Floor 4)' : 'Remote (WFH)',
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
