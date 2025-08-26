import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, ApiResponse } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-selector">
      <label for="userSelect" class="block text-sm font-medium text-gray-700 mb-2">
        เลือกผู้ใช้งาน (สำหรับการทดสอบ)
      </label>
      <select
        id="userSelect"
        [(ngModel)]="selectedUserId"
        (ngModelChange)="onUserChange($event)"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        [disabled]="loading"
      >
        <option value="" disabled>กรุณาเลือกผู้ใช้งาน</option>
        <option *ngFor="let user of users" [value]="user.id">
          {{ user.name }} ({{ user.role | titlecase }})
        </option>
      </select>

      <!-- Loading state -->
      <div *ngIf="loading" class="mt-2 text-sm text-gray-500">
        กำลังโหลดข้อมูลผู้ใช้งาน...
      </div>

      <!-- Error state -->
      <div *ngIf="error" class="mt-2 text-sm text-red-600">
        เกิดข้อผิดพลาด: {{ error }}
        <button
          (click)="loadUsers()"
          class="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          ลองใหม่
        </button>
      </div>

      <!-- Selected user info -->
      <div *ngIf="selectedUser" class="mt-3 p-3 bg-blue-50 rounded-md">
        <h4 class="text-sm font-medium text-blue-800">ผู้ใช้งานที่เลือก:</h4>
        <div class="mt-1 text-sm text-blue-700">
          <p><strong>ชื่อ:</strong> {{ selectedUser.name }}</p>
          <p><strong>เบอร์โทร:</strong> {{ selectedUser.phone }}</p>
          <p><strong>บทบาท:</strong> {{ selectedUser.role | titlecase }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-selector {
      max-width: 400px;
    }

    select:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
    }

    .loading-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class UserSelectorComponent implements OnInit {
  @Input() selectedUserId: number | string = '';
  @Output() userSelected = new EventEmitter<User | null>();

  users: User[] = [];
  selectedUser: User | null = null;
  loading = false;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;

    this.userService.getUsers().subscribe({
      next: (response: ApiResponse<User[]>) => {
        if (response.success) {
          this.users = response.data;
          // If there's a pre-selected user ID, find and set the user
          if (this.selectedUserId) {
            this.updateSelectedUser(this.selectedUserId);
          }
        } else {
          this.error = response.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        this.loading = false;
        console.error('Error loading users:', err);
      }
    });
  }

  onUserChange(userId: number | string) {
    this.updateSelectedUser(userId);
  }

  private updateSelectedUser(userId: number | string) {
    if (!userId) {
      this.selectedUser = null;
      this.userSelected.emit(null);
      return;
    }

    const user = this.users.find(u => u.id === Number(userId));
    this.selectedUser = user || null;
    this.userSelected.emit(this.selectedUser);
  }

  // Public method to get current selected user
  getCurrentUser(): User | null {
    return this.selectedUser;
  }

  // Public method to reset selection
  resetSelection() {
    this.selectedUserId = '';
    this.selectedUser = null;
    this.userSelected.emit(null);
  }
}
