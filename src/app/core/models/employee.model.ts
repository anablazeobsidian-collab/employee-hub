export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  joinDate: string; // ISO date string yyyy-mm-dd
  salary: number;
}

export const EMPLOYEE_DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Customer Success',
  'Legal',
] as const;

export const EMPLOYEE_STATUSES: EmployeeStatus[] = ['Active', 'On Leave', 'Terminated'];

// Standard corporate-style email domains allowed by the form validator.
export const ALLOWED_EMAIL_DOMAINS = [
  'company.com',
  'corp.com',
  'enterprise.com',
  'firm.com',
  'org.com',
  'tech.com',
  'group.com',
  'solutions.com',
  'ventures.com',
  'partners.com',
] as const;

export const ID_PATTERN = /^EMP-\d+$/;
