import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../library/UI/components/button/button';
import { InputField } from '../../../library/UI/components/input-field/input-field';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, InputField],
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

  teamSizeOptions = [
    { label: '1 – 50 Employees', value: '1-50' },
    { label: '50 – 250 Employees', value: '50-250' },
    { label: '250 – 1,000 Employees', value: '250-1000' },
    { label: '1,000+ Enterprise', value: '1000+' },
  ];

  topicOptions = [
    { label: 'Enterprise Demo Request', value: 'Enterprise Demo Request' },
    { label: 'HR & Payroll Module Inquiry', value: 'HR & Payroll Module Inquiry' },
    { label: 'Talent Hub Recruitment Sync Inquiry', value: 'Talent Hub Recruitment Sync Inquiry' },
    { label: 'Workspace Onboarding & CSV Migration', value: 'Workspace Onboarding & Migration' },
    { label: 'Technical & RBAC Security Support', value: 'Technical & Security Support' },
  ];

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
      q: 'How is Work-Sphere Recruitment linked to Talent Hub?',
      a: 'Job openings created in Work-Sphere sync conceptually with Talent Hub so external candidate applications flow directly into Work-Sphere’s 4-Phase evaluation and onboarding pipeline.',
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
