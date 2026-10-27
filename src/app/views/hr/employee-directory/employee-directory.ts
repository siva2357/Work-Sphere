import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  status: 'Active' | 'On Leave' | 'Remote';
  joiningDate: string;
  avatar: string;
  type: 'Full-time' | 'Contract' | 'Intern';
  manager: string;
}

@Component({
  selector: 'app-employee-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-directory.html',
  styleUrl: './employee-directory.css',
})
export class EmployeeDirectory implements OnInit {
  searchTerm = '';
  selectedDepartment = 'All';
  selectedStatus = 'All';
  viewMode: 'grid' | 'table' = 'grid';

  // Modals
  showAddEmployeeModal = false;
  showProfileModal = false;
  selectedEmployee: EmployeeRecord | null = null;

  // New Employee Form
  newEmployee = {
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    role: '',
    type: 'Full-time' as 'Full-time' | 'Contract' | 'Intern',
    location: 'Bangalore, India',
    manager: 'Sarah Jenkins',
    joiningDate: '2026-11-01'
  };

  employees: EmployeeRecord[] = [
    {
      id: 'WS-101',
      name: 'Eleanor Vance',
      role: 'Head of People & Culture',
      department: 'Human Resources',
      email: 'eleanor.vance@worksphere.io',
      phone: '+1 (555) 234-5678',
      location: 'Bangalore, India',
      status: 'Active',
      joiningDate: 'Jan 15, 2022',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      type: 'Full-time',
      manager: 'Executive Board'
    },
    {
      id: 'WS-102',
      name: 'Marcus Vance',
      role: 'VP of Engineering',
      department: 'Engineering',
      email: 'marcus.v@worksphere.io',
      phone: '+1 (555) 345-6789',
      location: 'Bangalore, India',
      status: 'Active',
      joiningDate: 'Mar 10, 2021',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      type: 'Full-time',
      manager: 'Executive Board'
    },
    {
      id: 'WS-103',
      name: 'Maya Lin',
      role: 'Backend Engineering Lead',
      department: 'Engineering',
      email: 'maya.lin@worksphere.io',
      phone: '+1 (555) 456-7890',
      location: 'Bangalore, India',
      status: 'Active',
      joiningDate: 'Aug 04, 2023',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      type: 'Full-time',
      manager: 'Marcus Vance'
    },
    {
      id: 'WS-104',
      name: 'Alex Rivera',
      role: 'Staff UX/UI Designer',
      department: 'Product & Design',
      email: 'alex.rivera@worksphere.io',
      phone: '+1 (555) 567-8901',
      location: 'Remote (Goa)',
      status: 'Remote',
      joiningDate: 'Nov 12, 2023',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'Full-time',
      manager: 'Diya Sen'
    },
    {
      id: 'WS-105',
      name: 'Priya Sharma',
      role: 'Senior Product Manager',
      department: 'Product & Design',
      email: 'priya.s@worksphere.io',
      phone: '+1 (555) 678-9012',
      location: 'Bangalore, India',
      status: 'Active',
      joiningDate: 'May 18, 2023',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      type: 'Full-time',
      manager: 'Executive Board'
    },
    {
      id: 'WS-106',
      name: 'David Miller',
      role: 'Senior Frontend Engineer',
      department: 'Engineering',
      email: 'david.miller@worksphere.io',
      phone: '+1 (555) 789-0123',
      location: 'Bangalore, India',
      status: 'Active',
      joiningDate: 'Oct 01, 2026',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      type: 'Full-time',
      manager: 'Maya Lin'
    },
    {
      id: 'WS-107',
      name: 'Sarah Connor',
      role: 'Associate Product Manager',
      department: 'Product & Design',
      email: 'sarah.connor@worksphere.io',
      phone: '+1 (555) 890-1234',
      location: 'Bangalore, India',
      status: 'On Leave',
      joiningDate: 'Feb 14, 2024',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      type: 'Full-time',
      manager: 'Priya Sharma'
    },
    {
      id: 'WS-108',
      name: 'Rohan Verma',
      role: 'Senior Growth & Sales Manager',
      department: 'Sales',
      email: 'rohan.v@worksphere.io',
      phone: '+1 (555) 901-2345',
      location: 'Mumbai, India',
      status: 'Active',
      joiningDate: 'Jun 20, 2023',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      type: 'Full-time',
      manager: 'Executive Board'
    }
  ];

  ngOnInit(): void {}

  get filteredEmployees(): EmployeeRecord[] {
    return this.employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            emp.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            emp.role.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            emp.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept = this.selectedDepartment === 'All' || emp.department === this.selectedDepartment;
      const matchesStatus = this.selectedStatus === 'All' || emp.status === this.selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }

  viewProfile(emp: EmployeeRecord) {
    this.selectedEmployee = emp;
    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.selectedEmployee = null;
  }

  openAddEmployee() {
    this.showAddEmployeeModal = true;
  }

  closeAddEmployee() {
    this.showAddEmployeeModal = false;
  }

  saveEmployee() {
    if (!this.newEmployee.name || !this.newEmployee.email) return;
    const newRecord: EmployeeRecord = {
      id: `WS-${100 + this.employees.length + 1}`,
      name: this.newEmployee.name,
      role: this.newEmployee.role || 'Associate Specialist',
      department: this.newEmployee.department,
      email: this.newEmployee.email,
      phone: this.newEmployee.phone || '+1 (555) 000-0000',
      location: this.newEmployee.location,
      status: 'Active',
      joiningDate: 'Today',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      type: this.newEmployee.type,
      manager: this.newEmployee.manager
    };
    this.employees.unshift(newRecord);
    this.closeAddEmployee();
  }
}
