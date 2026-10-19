import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  // Desktop sidebar collapsed (narrow) state
  private readonly _sidebarCollapsed$ = new BehaviorSubject<boolean>(false);
  readonly sidebarCollapsed$ = this._sidebarCollapsed$.asObservable();
  get sidebarCollapsed(): boolean {
    return this._sidebarCollapsed$.getValue();
  }

  // Mobile slide-out open state
  private readonly _mobileNavOpen$ = new BehaviorSubject<boolean>(false);
  readonly mobileNavOpen$ = this._mobileNavOpen$.asObservable();
  get mobileNavOpen(): boolean {
    return this._mobileNavOpen$.getValue();
  }

  toggleSidebar(): void {
    this._sidebarCollapsed$.next(!this._sidebarCollapsed$.getValue());
  }

  toggleMobileNav(force?: boolean): void {
    this._mobileNavOpen$.next(force ?? !this._mobileNavOpen$.getValue());
  }

  closeMobileNav(): void {
    this._mobileNavOpen$.next(false);
  }
}
