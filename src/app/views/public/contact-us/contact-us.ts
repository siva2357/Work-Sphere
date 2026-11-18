import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../library/UI/components/button/button';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs {
  contactForm = {
    fullName: '',
    workEmail: '',
    companyName: '',
    teamSize: '50-250',
    topic: 'Enterprise Demo Request',
    message: '',
  };

  isSubmitting = false;
  submittedSuccess = false;
  errorMessage = '';

  contactChannels = [
    {
      icon: 'bi-headset',
      title: 'Enterprise Sales & Demos',
      detail: 'Schedule a walkthrough of HR & Employee portals tailored to your org structure.',
      contact: 'sales@worksphere.io',
      badge: 'Replies in 2 hrs',
    },
    {
      icon: 'bi-shield-check',
      title: 'Technical & RBAC Support',
      detail: 'Assistance with SSO, JWT tokens, department imports, and workspace provisioning.',
      contact: 'support@worksphere.io',
      badge: '24/7 Priority SLA',
    },
    {
      icon: 'bi-geo-alt-fill',
      title: 'Global Operations Hub',
      detail: 'Suite 400, Tech Park Corridor, Financial District · Hybrid Cloud Infrastructure.',
      contact: '+1 (800) 555-0199',
      badge: 'Mon–Fri, 9am–6pm',
    },
  ];

  faqs = [
    {
      q: 'How does Work-Sphere route users between HR and Employee portals?',
      a: 'Upon login, Work-Sphere inspects the authenticated user role and organizational hierarchy to automatically direct HR administrators to the HR Management Center and staff members to the Employee Workspace.',
    },
    {
      q: 'Can we bulk-import our existing employee directory?',
      a: 'Yes. Work-Sphere supports structured employee data onboarding including departments, designations, organizational levels, and reporting managers.',
    },
    {
      q: 'Are payslips and official HR letters generated inside the platform?',
      a: 'Yes. Both itemized monthly payslips and official HR letters (offer, experience, appraisal) are rendered directly in-app using dedicated document components.',
    },
  ];

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.contactForm.fullName.trim() || !this.contactForm.workEmail.trim() || !this.contactForm.message.trim()) {
      this.errorMessage = 'Please complete your name, corporate email, and message before submitting.';
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.submittedSuccess = true;
    }, 400);
  }

  resetForm(): void {
    this.contactForm = {
      fullName: '',
      workEmail: '',
      companyName: '',
      teamSize: '50-250',
      topic: 'Enterprise Demo Request',
      message: '',
    };
    this.submittedSuccess = false;
    this.errorMessage = '';
  }
}
