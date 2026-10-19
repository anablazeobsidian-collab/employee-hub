import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import {
  ALLOWED_EMAIL_DOMAINS,
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_STATUSES,
  Employee,
  EmployeeStatus,
  ID_PATTERN,
} from '../../core/models/employee.model';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-3xl space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-2 text-sm text-slate-400">
            <a routerLink="/employees" class="hover:text-brand-600">Directory</a>
            <span>/</span>
            <span class="text-slate-600">{{ isEdit() ? 'Edit' : 'New' }}</span>
          </div>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {{ isEdit() ? 'Edit Employee' : 'Onboard New Employee' }}
          </h1>
          <p class="text-sm text-slate-500">
            {{ isEdit() ? 'Update profile details for ' + formTitle() : 'Fill in the details below to add a new employee.' }}
          </p>
        </div>
        <a routerLink="/employees" class="btn-secondary self-start sm:self-auto">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M11 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Back
        </a>
      </div>

      <!-- Error banner -->
      @if (errorMessage()) {
        <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 animate-fade-in-up">
          {{ errorMessage() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="submit()" class="card space-y-6 p-6" novalidate>
        <!-- Identity -->
        <section>
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-400">Identity</h2>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- ID -->
            <div>
              <label class="label" for="id">Employee ID <span class="text-rose-500">*</span></label>
              <input
                id="id"
                type="text"
                formControlName="id"
                placeholder="EMP-1001"
                class="input"
                [class.input-error]="invalid('id')"
              />
              @if (invalid('id')) {
                <p class="mt-1 text-xs text-rose-600">{{ idError() }}</p>
              } @else {
                <p class="mt-1 text-xs text-slate-400">Format: EMP- followed by digits.</p>
              }
            </div>
            <!-- Status -->
            <div>
              <label class="label" for="status">Status <span class="text-rose-500">*</span></label>
              <select id="status" formControlName="status" class="input" [class.input-error]="invalid('status')">
                @for (s of statuses; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
              @if (invalid('status')) {
                <p class="mt-1 text-xs text-rose-600">Select a status.</p>
              }
            </div>
            <!-- First name -->
            <div>
              <label class="label" for="firstName">First Name <span class="text-rose-500">*</span></label>
              <input id="firstName" type="text" formControlName="firstName" class="input" [class.input-error]="invalid('firstName')" />
              @if (invalid('firstName')) {
                <p class="mt-1 text-xs text-rose-600">First name is required.</p>
              }
            </div>
            <!-- Last name -->
            <div>
              <label class="label" for="lastName">Last Name <span class="text-rose-500">*</span></label>
              <input id="lastName" type="text" formControlName="lastName" class="input" [class.input-error]="invalid('lastName')" />
              @if (invalid('lastName')) {
                <p class="mt-1 text-xs text-rose-600">Last name is required.</p>
              }
            </div>
            <!-- Email -->
            <div class="sm:col-span-2">
              <label class="label" for="email">Corporate Email <span class="text-rose-500">*</span></label>
              <input id="email" type="email" formControlName="email" placeholder="name@company.com" class="input" [class.input-error]="invalid('email')" />
              @if (invalid('email')) {
                <p class="mt-1 text-xs text-rose-600">{{ emailError() }}</p>
              } @else {
                <p class="mt-1 text-xs text-slate-400">Allowed domains: {{ allowedDomainsList }}</p>
              }
            </div>
          </div>
        </section>

        <!-- Role -->
        <section>
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-400">Role</h2>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Department -->
            <div>
              <label class="label" for="department">Department <span class="text-rose-500">*</span></label>
              <select id="department" formControlName="department" class="input" [class.input-error]="invalid('department')">
                <option value="" disabled>Select department</option>
                @for (d of departments; track d) {
                  <option [value]="d">{{ d }}</option>
                }
              </select>
              @if (invalid('department')) {
                <p class="mt-1 text-xs text-rose-600">Select a department.</p>
              }
            </div>
            <!-- Position -->
            <div>
              <label class="label" for="position">Position <span class="text-rose-500">*</span></label>
              <input id="position" type="text" formControlName="position" class="input" [class.input-error]="invalid('position')" />
              @if (invalid('position')) {
                <p class="mt-1 text-xs text-rose-600">Position is required.</p>
              }
            </div>
            <!-- Join date -->
            <div>
              <label class="label" for="joinDate">Join Date <span class="text-rose-500">*</span></label>
              <input id="joinDate" type="date" formControlName="joinDate" class="input" [class.input-error]="invalid('joinDate')" />
              @if (invalid('joinDate')) {
                <p class="mt-1 text-xs text-rose-600">{{ joinDateError() }}</p>
              }
            </div>
            <!-- Salary -->
            <div>
              <label class="label" for="salary">Salary (USD) <span class="text-rose-500">*</span></label>
              <input id="salary" type="number" min="0" step="1000" formControlName="salary" class="input" [class.input-error]="invalid('salary')" />
              @if (invalid('salary')) {
                <p class="mt-1 text-xs text-rose-600">{{ salaryError() }}</p>
              } @else {
                <p class="mt-1 text-xs text-slate-400">Annual salary between 30,000 and 1,000,000.</p>
              }
            </div>
          </div>
        </section>

        <!-- Actions -->
        <div class="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <a routerLink="/employees" class="btn-secondary justify-center">Cancel</a>
          <button type="submit" class="btn-primary justify-center" [disabled]="submitting()">
            @if (submitting()) {
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round" />
              </svg>
              Saving...
            } @else {
              {{ isEdit() ? 'Save Changes' : 'Create Employee' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class EmployeeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly empService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly departments = [...EMPLOYEE_DEPARTMENTS];
  readonly statuses: EmployeeStatus[] = [...EMPLOYEE_STATUSES];
  readonly allowedDomainsList = ALLOWED_EMAIL_DOMAINS.join(', ');

  readonly isEdit = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly formTitle = signal('');

  readonly form: FormGroup = this.fb.group({
    id: ['', [Validators.required, Validators.pattern(ID_PATTERN)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email, this.corporateDomainValidator]],
    department: ['', Validators.required],
    position: ['', [Validators.required, Validators.minLength(2)]],
    status: ['Active', Validators.required],
    joinDate: ['', [Validators.required, this.notFutureValidator]],
    salary: [null, [Validators.required, Validators.min(30000), Validators.max(1000000)]],
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        const existing = this.empService.getById(id);
        if (existing) {
          this.isEdit.set(true);
          this.formTitle.set(`${existing.firstName} ${existing.lastName}`);
          // Disable ID editing in edit mode to preserve identity
          this.form.get('id')?.setValue(existing.id);
          this.form.get('id')?.disable();
          this.form.patchValue({
            firstName: existing.firstName,
            lastName: existing.lastName,
            email: existing.email,
            department: existing.department,
            position: existing.position,
            status: existing.status,
            joinDate: existing.joinDate,
            salary: existing.salary,
          });
        } else {
          this.errorMessage.set(`Employee ${id} was not found. You can create a new one below.`);
        }
      }
    });
  }

  private corporateDomainValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '') as string;
    if (!value) return null;
    const domain = value.split('@')[1]?.toLowerCase();
    if (!domain) return { domain: true };
    return ALLOWED_EMAIL_DOMAINS.includes(domain as (typeof ALLOWED_EMAIL_DOMAINS)[number])
      ? null
      : { domain: true };
  }

  private notFutureValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '') as string;
    if (!value) return null;
    const today = new Date().toISOString().slice(0, 10);
    return value > today ? { future: true } : null;
  }

  invalid(field: string): boolean {
    const c = this.form.get(field);
    if (!c) return false;
    return c.invalid && (c.touched || c.dirty);
  }

  idError(): string {
    const c = this.form.get('id');
    if (c?.hasError('required')) return 'ID is required.';
    if (c?.hasError('pattern')) return 'ID must match the format EMP-XXXX (e.g., EMP-1001).';
    return 'Invalid ID.';
  }

  emailError(): string {
    const c = this.form.get('email');
    if (c?.hasError('required')) return 'Email is required.';
    if (c?.hasError('email')) return 'Enter a valid email address.';
    if (c?.hasError('domain')) return 'Use an approved corporate domain.';
    return 'Invalid email.';
  }

  joinDateError(): string {
    const c = this.form.get('joinDate');
    if (c?.hasError('required')) return 'Join date is required.';
    if (c?.hasError('future')) return 'Join date cannot be in the future.';
    return 'Invalid date.';
  }

  salaryError(): string {
    const c = this.form.get('salary');
    if (c?.hasError('required')) return 'Salary is required.';
    if (c?.hasError('min')) return 'Salary must be at least $30,000.';
    if (c?.hasError('max')) return 'Salary cannot exceed $1,000,000.';
    return 'Invalid salary.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const id = raw.id as string;
    const employee: Employee = {
      id,
      firstName: (raw.firstName as string).trim(),
      lastName: (raw.lastName as string).trim(),
      email: (raw.email as string).trim().toLowerCase(),
      department: raw.department as string,
      position: (raw.position as string).trim(),
      status: raw.status as EmployeeStatus,
      joinDate: raw.joinDate as string,
      salary: Number(raw.salary),
    };

    if (!this.isEdit() && this.empService.idExists(id)) {
      this.submitting.set(false);
      this.errorMessage.set(`Employee ID ${id} already exists. Please use a unique ID.`);
      return;
    }

    if (this.isEdit()) {
      this.empService.update(id, employee);
    } else {
      this.empService.add(employee);
    }

    this.submitting.set(false);
    this.router.navigate(['/employees'], {
      queryParams: { msg: this.isEdit() ? `Updated ${employee.firstName} ${employee.lastName}.` : `Added ${employee.firstName} ${employee.lastName}.` },
    });
  }
}
