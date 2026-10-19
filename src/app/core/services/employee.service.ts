import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { SEED_EMPLOYEES } from './employee-storage.seed';

const STORAGE_KEY = 'employee-hub.employees.v1';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly _employees$ = new BehaviorSubject<Employee[]>(this.load());
  readonly employees$: Observable<Employee[]> = this._employees$.asObservable();

  get snapshot(): Employee[] {
    return this._employees$.getValue();
  }

  getAll(): Employee[] {
    return [...this._employees$.getValue()];
  }

  getById(id: string): Employee | undefined {
    return this._employees$.getValue().find((e) => e.id === id);
  }

  add(employee: Employee): void {
    const next = [...this._employees$.getValue(), employee];
    this.commit(next);
  }

  update(id: string, patch: Partial<Employee>): void {
    const next = this._employees$.getValue().map((e) =>
      e.id === id ? { ...e, ...patch, id: e.id } : e,
    );
    this.commit(next);
  }

  remove(id: string): void {
    const next = this._employees$.getValue().filter((e) => e.id !== id);
    this.commit(next);
  }

  idExists(id: string, except?: string): boolean {
    return this._employees$.getValue().some((e) => e.id === id && e.id !== except);
  }

  private commit(employees: Employee[]): void {
    this._employees$.next(employees);
    this.persist(employees);
  }

  private persist(employees: Employee[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch {
      // Storage unavailable (private mode / quota) — state stays in-memory only.
    }
  }

  private load(): Employee[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Employee[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fall through to seeding
    }
    const seed = [...SEED_EMPLOYEES];
    this.persist(seed);
    return seed;
  }
}
