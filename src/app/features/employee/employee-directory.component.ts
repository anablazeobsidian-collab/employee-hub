import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/employee.model';
import { STATUS_DOT, STATUS_STYLES } from '../../core/services/employee-storage.seed';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';

@Component({
  selector: 'app-employee-directory',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Employee Directory</h1>
          <p class="text-sm text-slate-500">Search, edit, and manage all employee records.</p>
        </div>
        <a routerLink="/employees/manage" class="btn-primary self-start sm:self-auto">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          Onboard Employee
        </a>
      </div>

      <!-- Success banner -->
      @if (successMessage()) {
        <div
          class="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 animate-fade-in-up"
        >
          <span class="flex items-center gap-2">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ successMessage() }}
          </span>
          <button class="text-emerald-600 hover:text-emerald-800" (click)="successMessage.set(null)" aria-label="Dismiss">&times;</button>
        </div>
      }

      <!-- Toolbar -->
      <div class="card p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative flex-1">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
            </svg>
            <input
              [formControl]="searchControl"
              type="text"
              placeholder="Search by ID, name, or department..."
              class="input pl-9"
            />
          </div>
          <div class="flex items-center gap-2">
            <select [formControl]="statusFilter" class="input min-w-[140px]">
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
            <span class="hidden text-sm text-slate-500 sm:inline">Showing {{ filtered().length }} of {{ total() }}</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th class="px-4 py-3 font-medium">Employee</th>
                <th class="px-4 py-3 font-medium">Department</th>
                <th class="px-4 py-3 font-medium">Position</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 font-medium">Salary</th>
                <th class="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (e of filtered(); track e.id) {
                <tr class="hover:bg-slate-50/60">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                        {{ initials(e) }}
                      </div>
                      <div>
                        <p class="font-medium text-slate-900">{{ e.firstName }} {{ e.lastName }}</p>
                        <p class="text-xs text-slate-400">{{ e.id }} &middot; {{ e.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-slate-600">{{ e.department }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ e.position }}</td>
                  <td class="px-4 py-3">
                    <span class="badge" [class]="statusStyle(e.status)">
                      <span class="h-1.5 w-1.5 rounded-full" [class]="statusDot(e.status)"></span>
                      {{ e.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-700">{{ e.salary | currency: 'USD':'symbol':'1.0-0' }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1.5">
                      <a
                        [routerLink]="['/employees/manage']"
                        [queryParams]="{ id: e.id }"
                        class="btn-ghost !px-2.5 !py-1.5 text-xs"
                        title="Edit"
                      >
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 20h9" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Edit
                      </a>
                      <button
                        type="button"
                        class="btn-ghost !px-2.5 !py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                        (click)="askDelete(e)"
                        title="Delete"
                      >
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td class="px-4 py-12 text-center" colspan="6">
                    <div class="mx-auto flex max-w-sm flex-col items-center gap-2 text-slate-400">
                      <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
                      </svg>
                      <p class="text-sm font-medium text-slate-600">No employees found</p>
                      <p class="text-xs">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete confirmation -->
      @if (pendingDelete()) {
        <app-confirm-modal
          [message]="'Are you sure you want to permanently delete ' + pendingDelete()!.firstName + ' ' + pendingDelete()!.lastName + ' (' + pendingDelete()!.id + ')? This action cannot be undone.'"
          (confirmed)="confirmDelete()"
          (cancelled)="pendingDelete.set(null)"
        />
      }
    </div>
  `,
})
export class EmployeeDirectoryComponent {
  private readonly empService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly searchControl = new FormControl('');
  readonly statusFilter = new FormControl('');

  private readonly employees = signal<Employee[]>(this.empService.getAll());
  private readonly searchTerm = signal<string>('');
  private readonly statusValue = signal<string>('');

  readonly successMessage = signal<string | null>(null);
  readonly pendingDelete = signal<Employee | null>(null);

  constructor() {
    this.empService.employees$.subscribe((list) => this.employees.set(list));

    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((v) => this.searchTerm.set((v ?? '').trim()));

    this.statusFilter.valueChanges.subscribe((v) => this.statusValue.set((v ?? '').trim()));

    // Seed the search box from query params (e.g., from header quick search)
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q');
      if (q !== null) {
        this.searchControl.setValue(q, { emitEvent: false });
        this.searchTerm.set(q.trim());
      }
      const msg = params.get('msg');
      if (msg) {
        this.successMessage.set(msg);
      }
    });
  }

  readonly total = computed(() => this.employees().length);

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusValue();
    return this.employees().filter((e) => {
      const matchesTerm =
        !term ||
        e.id.toLowerCase().includes(term) ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(term) ||
        e.department.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term);
      const matchesStatus = !status || e.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  askDelete(e: Employee): void {
    this.pendingDelete.set(e);
  }

  confirmDelete(): void {
    const target = this.pendingDelete();
    if (!target) return;
    this.empService.remove(target.id);
    this.pendingDelete.set(null);
    this.successMessage.set(`Deleted ${target.firstName} ${target.lastName} (${target.id}).`);
    // Clear success after a few seconds
    setTimeout(() => this.successMessage.set(null), 4000);
  }

  initials(e: Employee): string {
    return (e.firstName.charAt(0) + e.lastName.charAt(0)).toUpperCase();
  }
  statusStyle(status: Employee['status']): string {
    return STATUS_STYLES[status];
  }
  statusDot(status: Employee['status']): string {
    return STATUS_DOT[status];
  }
}
