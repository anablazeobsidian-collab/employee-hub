import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { DEPARTMENT_COLORS, STATUS_DOT, STATUS_STYLES } from '../../core/services/employee-storage.seed';
import { Employee } from '../../core/models/employee.model';

interface Metric {
  label: string;
  value: string;
  raw: number;
  icon: string;
  accent: string;
}

interface DeptSlice {
  name: string;
  count: number;
  pct: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p class="text-sm text-slate-500">Workforce insights at a glance, updated in real time.</p>
        </div>
        <a routerLink="/employees" class="btn-secondary self-start sm:self-auto">
          View directory
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (m of metrics(); track m.label) {
          <div class="card p-5 animate-fade-in-up">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-slate-500">{{ m.label }}</p>
                <p class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ m.value }}</p>
              </div>
              <div class="flex h-10 w-10 items-center justify-center rounded-lg" [class]="m.accent" [innerHTML]="m.icon"></div>
            </div>
          </div>
        }
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Department distribution -->
        <div class="card p-6 lg:col-span-2">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Headcount by Department</h2>
              <p class="text-xs text-slate-500">Distribution of current employees</p>
            </div>
            <span class="badge bg-slate-100 text-slate-600">{{ total() }} total</span>
          </div>

          <!-- Stacked bar -->
          <div class="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            @for (s of deptSlices(); track s.name) {
              <div [class]="s.color" [style.width.%]="s.pct" [title]="s.name + ': ' + s.count"></div>
            }
          </div>

          <!-- Legend list -->
          <ul class="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            @for (s of deptSlices(); track s.name) {
              <li class="flex items-center gap-3">
                <span class="h-2.5 w-2.5 rounded-full" [class]="s.color"></span>
                <span class="flex-1 truncate text-sm text-slate-700">{{ s.name }}</span>
                <span class="text-sm font-medium text-slate-900">{{ s.count }}</span>
                <span class="w-12 text-right text-xs text-slate-400">{{ s.pct | number: '1.0-0' }}%</span>
              </li>
            }
          </ul>
        </div>

        <!-- Status breakdown -->
        <div class="card p-6">
          <h2 class="text-base font-semibold text-slate-900">Status Breakdown</h2>
          <p class="text-xs text-slate-500">Current workforce status</p>

          <div class="mt-5 space-y-4">
            @for (s of statusRows(); track s.status) {
              <div>
                <div class="mb-1.5 flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2 text-slate-700">
                    <span class="h-2 w-2 rounded-full" [class]="s.dot"></span>
                    {{ s.status }}
                  </span>
                  <span class="font-medium text-slate-900">{{ s.count }}</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full rounded-full" [class]="s.bar" [style.width.%]="s.pct"></div>
                </div>
              </div>
            }
          </div>

          <div class="mt-6 rounded-lg bg-slate-50 p-4">
            <p class="text-xs text-slate-500">Retention rate</p>
            <p class="mt-1 text-2xl font-semibold text-slate-900">{{ retention() | number: '1.0-1' }}%</p>
            <p class="mt-1 text-xs text-slate-400">Active + On Leave vs. total headcount</p>
          </div>
        </div>
      </div>

      <!-- Recent hires -->
      <div class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Recent Hires</h2>
            <p class="text-xs text-slate-500">Latest employees to join the company</p>
          </div>
          <a routerLink="/employees" class="text-sm font-medium text-brand-600 hover:text-brand-700">See all</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th class="px-6 py-3 font-medium">Employee</th>
                <th class="px-6 py-3 font-medium">Department</th>
                <th class="px-6 py-3 font-medium">Position</th>
                <th class="px-6 py-3 font-medium">Status</th>
                <th class="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (e of recentHires(); track e.id) {
                <tr class="hover:bg-slate-50/60">
                  <td class="px-6 py-3">
                    <div class="flex items-center gap-3">
                      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                        {{ initials(e) }}
                      </div>
                      <div>
                        <p class="font-medium text-slate-900">{{ e.firstName }} {{ e.lastName }}</p>
                        <p class="text-xs text-slate-400">{{ e.id }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-3 text-slate-600">{{ e.department }}</td>
                  <td class="px-6 py-3 text-slate-600">{{ e.position }}</td>
                  <td class="px-6 py-3">
                    <span class="badge" [class]="statusStyle(e.status)">
                      <span class="h-1.5 w-1.5 rounded-full" [class]="statusDot(e.status)"></span>
                      {{ e.status }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-slate-500">{{ e.joinDate }}</td>
                </tr>
              } @empty {
                <tr><td class="px-6 py-8 text-center text-slate-400" colspan="5">No employees yet.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private readonly empService = inject(EmployeeService);

  private readonly employees = signal<Employee[]>(this.empService.getAll());

  constructor() {
    this.empService.employees$.subscribe((list) => this.employees.set(list));
  }

  readonly total = computed(() => this.employees().length);

  readonly metrics = computed<Metric[]>(() => {
    const list = this.employees();
    const active = list.filter((e) => e.status === 'Active').length;
    const onLeave = list.filter((e) => e.status === 'On Leave').length;
    const avg =
      list.length > 0
        ? Math.round(list.reduce((sum, e) => sum + e.salary, 0) / list.length)
        : 0;
    return [
      {
        label: 'Total Employees',
        value: String(list.length),
        raw: list.length,
        accent: 'bg-brand-50 text-brand-600',
        icon: usersIcon(),
      },
      {
        label: 'Active',
        value: String(active),
        raw: active,
        accent: 'bg-emerald-50 text-emerald-600',
        icon: checkIcon(),
      },
      {
        label: 'On Leave',
        value: String(onLeave),
        raw: onLeave,
        accent: 'bg-amber-50 text-amber-600',
        icon: clockIcon(),
      },
      {
        label: 'Average Salary',
        value: avg > 0 ? '$' + avg.toLocaleString('en-US') : '$0',
        raw: avg,
        accent: 'bg-teal-50 text-teal-600',
        icon: dollarIcon(),
      },
    ];
  });

  readonly deptSlices = computed<DeptSlice[]>(() => {
    const list = this.employees();
    const total = list.length || 1;
    const counts = new Map<string, number>();
    for (const e of list) counts.set(e.department, (counts.get(e.department) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        pct: (count / total) * 100,
        color: DEPARTMENT_COLORS[name] ?? 'bg-slate-400',
      }))
      .sort((a, b) => b.count - a.count);
  });

  readonly statusRows = computed(() => {
    const list = this.employees();
    const total = list.length || 1;
    const cfg: { status: Employee['status']; dot: string; bar: string }[] = [
      { status: 'Active', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
      { status: 'On Leave', dot: 'bg-amber-500', bar: 'bg-amber-500' },
      { status: 'Terminated', dot: 'bg-rose-500', bar: 'bg-rose-500' },
    ];
    return cfg.map((c) => {
      const count = list.filter((e) => e.status === c.status).length;
      return { ...c, count, pct: (count / total) * 100 };
    });
  });

  readonly retention = computed(() => {
    const list = this.employees();
    if (list.length === 0) return 0;
    const retained = list.filter((e) => e.status !== 'Terminated').length;
    return (retained / list.length) * 100;
  });

  readonly recentHires = computed(() =>
    [...this.employees()]
      .sort((a, b) => (a.joinDate < b.joinDate ? 1 : -1))
      .slice(0, 5),
  );

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

function usersIcon(): string {
  return `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function checkIcon(): string {
  return `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function clockIcon(): string {
  return `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function dollarIcon(): string {
  return `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
