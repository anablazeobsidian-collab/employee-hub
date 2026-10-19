import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiStateService } from '../core/services/ui-state.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="sidebar-transition flex h-full flex-col border-r border-slate-200 bg-white"
      [class.w-64]="!collapsed"
      [class.w-20]="collapsed"
    >
      <!-- Brand -->
      <div class="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7l9-4 9 4-9 4-9-4z" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M3 12l9 4 9-4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M3 17l9 4 9-4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        @if (!collapsed) {
          <div class="overflow-hidden">
            <p class="truncate text-sm font-semibold text-slate-900">Employee Hub</p>
            <p class="truncate text-xs text-slate-400">Workforce Suite</p>
          </div>
        }
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto px-2 py-4">
        <p
          class="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
          [class.hidden]="collapsed"
        >
          Workspace
        </p>
        <ul class="space-y-1">
          @for (item of navItems; track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="active-link"
                class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                (click)="onNavigate()"
                [title]="collapsed ? item.label : null"
              >
                <span class="flex h-5 w-5 shrink-0 items-center justify-center" [innerHTML]="item.icon"></span>
                <span class="truncate" [class.hidden]="collapsed">{{ item.label }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- Collapse toggle (desktop only) -->
      <div class="hidden border-t border-slate-100 p-3 md:block">
        <button
          type="button"
          class="btn-ghost w-full justify-start"
          (click)="ui.toggleSidebar()"
          [title]="collapsed ? 'Expand' : 'Collapse'"
        >
          <svg
            class="h-5 w-5 transition-transform"
            [class.rotate-180]="collapsed"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span [class.hidden]="collapsed">Collapse</span>
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .active-link {
        background-color: rgb(238 244 255);
        color: rgb(35 72 224);
      }
    `,
  ],
})
export class SidebarComponent {
  readonly ui = inject(UiStateService);
  collapsed = false;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: dashboardIcon() },
    { label: 'Employee Directory', path: '/employees', icon: directoryIcon() },
    { label: 'Manage Employee', path: '/employees/manage', icon: manageIcon() },
  ];

  constructor() {
    this.ui.sidebarCollapsed$.subscribe((v) => (this.collapsed = v));
  }

  onNavigate(): void {
    this.ui.closeMobileNav();
  }
}

function dashboardIcon(): string {
  return `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5" stroke-linecap="round"/><rect x="14" y="3" width="7" height="5" rx="1.5" stroke-linecap="round"/><rect x="14" y="12" width="7" height="9" rx="1.5" stroke-linecap="round"/><rect x="3" y="16" width="7" height="5" rx="1.5" stroke-linecap="round"/></svg>`;
}
function directoryIcon(): string {
  return `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function manageIcon(): string {
  return `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16M4 8h16M4 16h16" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
