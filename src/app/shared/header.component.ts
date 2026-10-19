import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UiStateService } from '../core/services/ui-state.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header
      class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6"
    >
      <!-- Mobile hamburger -->
      <button
        type="button"
        class="btn-ghost !p-2 md:hidden"
        (click)="ui.toggleMobileNav()"
        aria-label="Open navigation"
      >
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round" />
        </svg>
      </button>

      <!-- Desktop collapse -->
      <button
        type="button"
        class="btn-ghost !p-2 hidden md:inline-flex"
        (click)="ui.toggleSidebar()"
        aria-label="Toggle sidebar"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round" />
        </svg>
      </button>

      <!-- Search-ish title -->
      <div class="flex flex-1 items-center">
        <div class="relative hidden w-full max-w-md sm:block">
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
            type="text"
            placeholder="Quick search employees..."
            class="input pl-9"
            (keyup)="onQuickSearch($event)"
          />
        </div>
      </div>

      <!-- Right cluster -->
      <div class="flex items-center gap-2">
        <button type="button" class="btn-ghost !p-2" aria-label="Notifications">
          <svg class="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button routerLink="/employees/manage" class="btn-primary hidden sm:inline-flex">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          New Employee
        </button>
        <div class="ml-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            JD
          </div>
          <div class="hidden leading-tight lg:block">
            <p class="text-xs font-semibold text-slate-800">Jamie Doe</p>
            <p class="text-[11px] text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly ui = inject(UiStateService);
  private readonly router = inject(Router);

  onQuickSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.router.navigate(['/employees'], { queryParams: { q: value || null } });
  }
}
