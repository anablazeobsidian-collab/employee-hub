import { Routes } from '@angular/router';
import { AppShellComponent } from './core/app-shell.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employee/employee-directory.component').then(
            (m) => m.EmployeeDirectoryComponent,
          ),
      },
      {
        path: 'employees/manage',
        loadComponent: () =>
          import('./features/employee/employee-form.component').then((m) => m.EmployeeFormComponent),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
