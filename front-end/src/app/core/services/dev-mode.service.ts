import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevModeService {
  private readonly STORAGE_KEY = 'devMode';
  private _isDevMode$: BehaviorSubject<boolean>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize with proper platform check
    this._isDevMode$ = new BehaviorSubject<boolean>(this.getInitialDevMode());

    // Listen for storage changes from other tabs (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (event) => {
        if (event.key === this.STORAGE_KEY) {
          const newValue = event.newValue === 'true';
          this._isDevMode$.next(newValue);
        }
      });
    }
  }

  get isDevMode(): boolean {
    return this._isDevMode$.value;
  }

  get isDevMode$(): Observable<boolean> {
    return this._isDevMode$.asObservable();
  }

  toggleDevMode(): void {
    const newValue = !this._isDevMode$.value;
    this.setDevMode(newValue);
  }

  setDevMode(enabled: boolean): void {
    this._isDevMode$.next(enabled);
    // Only use localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, enabled.toString());
    }
    console.log(`Dev Mode: ${enabled ? 'ON (Using Mock Data)' : 'OFF (Using Real API)'}`);
  }

  private getInitialDevMode(): boolean {
    // Check localStorage first (only in browser), fallback to environment
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return environment.isDevMode;
  }
}
