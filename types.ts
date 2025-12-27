
export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  contactName?: string;
}

export interface Machine {
  id: string;
  customerId: string;
  name: string;
  serialNumber: string;
  installDate: string;
  location?: string;
}

export interface ServiceCheckItem {
  machineId: string;
  status: 'Pending' | 'Passed' | 'Failed';
  note?: string;
  attachments?: string[]; // Array of image URLs/Base64
}

export interface Job {
  id: string;
  customerId: string;
  machineId?: string; // Optional for Annual Service
  engineerId: string;
  type: 'Standard' | 'AnnualService';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency' | 'None'; // Added None for Annual Service
  status: 'Scheduled' | 'In Progress' | 'Completed';
  date: string;
  instructions?: string;
  estimatedDuration?: string;
  checklist?: ServiceCheckItem[];
}

export type UserRole = 'FullTime' | 'Trainee';

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
}

// Navigation Types
export type ScreenName = 'home' | 'my-jobs' | 'history' | 'profile' | 'create-work-order' | 'job-details' | 'edit-job' | 'customer-assets';
