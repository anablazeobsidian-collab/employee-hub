import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../shared/header.component';
import { SidebarComponent } from '../shared/sidebar.component';
import { UiStateService } from './services/ui-state.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <!-- Desktop sidebar -->
      <div class="hidden md:block">
        <app-sidebar />
      </div>

      <!-- Mobile slide-out -->
      @if (mobileOpen) {
        <div class="fixed inset-0 z-50 md:hidden">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" (click)="ui.closeMobileNav()"></div>
          <div class="absolute left-0 top-0 h-full animate-fade-in-up">
            <app-sidebar />
          </div>
        </div>
      }

      <!-- Main -->
      <div class="flex min-w-0 flex-1 flex-col">
        <app-header />
        <main class="flex-1 overflow-y-auto">
          <div class="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class AppShellComponent {
  readonly ui = inject(UiStateService);
  mobileOpen = false;

  constructor() {
    this.ui.mobileNavOpen$.subscribe((v) => (this.mobileOpen = v));
  }
}
