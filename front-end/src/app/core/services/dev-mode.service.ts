import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevModeService {
  private _isDevMode = environment.isDevMode;

  get isDevMode(): boolean {
    return this._isDevMode;
  }

  toggleDevMode(): void {
    this._isDevMode = !this._isDevMode;
    console.log(`Dev Mode: ${this._isDevMode ? 'ON (Using Mock Data)' : 'OFF (Using Real API)'}`);
  }

  setDevMode(enabled: boolean): void {
    this._isDevMode = enabled;
    console.log(`Dev Mode: ${this._isDevMode ? 'ON (Using Mock Data)' : 'OFF (Using Real API)'}`);
  }
}