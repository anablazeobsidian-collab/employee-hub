import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" (click)="cancel()"></div>
      <div class="card relative z-10 w-full max-w-md p-6 animate-fade-in-up shadow-cardlg">
        <div class="flex items-start gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v4M12 17h.01" stroke-linecap="round" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-base font-semibold text-slate-900">Delete employee?</h3>
            <p class="mt-1 text-sm text-slate-500">{{ message }}</p>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="btn-secondary" (click)="cancel()">Cancel</button>
          <button type="button" class="btn-danger" (click)="confirm()">Delete</button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  @Input() message = 'This action cannot be undone.';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm(): void {
    this.confirmed.emit();
  }
  cancel(): void {
    this.cancelled.emit();
  }
}
