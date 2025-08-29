import { Injectable } from '@angular/core'
import { Observable, of, BehaviorSubject, delay, throwError } from 'rxjs'
import { User, LoginRequest, RegisterRequest } from '../models/user.model'

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null)
    public currentUser$ = this.currentUserSubject.asObservable()

    private mockUsers: User[] = [
        {
            id: 'user1',
            email: 'john.doe@example.com',
            name: 'John Doe',
            phone: '+1234567890',
            createdAt: new Date('2025-01-01'),
            isAdmin: false,
        },
        {
            id: 'user2',
            email: 'jane.smith@example.com',
            name: 'Jane Smith',
            phone: '+1234567891',
            createdAt: new Date('2025-01-02'),
            isAdmin: false,
        },
        {
            id: 'admin1',
            email: 'admin@eventticketing.com',
            name: 'Admin User',
            phone: '+1234567892',
            createdAt: new Date('2025-01-01'),
            isAdmin: true,
        },
    ]

    constructor() {
        // Check if user is already logged in (from localStorage)
        // Only access localStorage in browser environment
        if (
            typeof window !== 'undefined' &&
            typeof localStorage !== 'undefined'
        ) {
            const savedUser = localStorage.getItem('currentUser')
            if (savedUser) {
                this.currentUserSubject.next(JSON.parse(savedUser))
            }
        }
    }

    private setUserInStorage(user: User): void {
        if (
            typeof window !== 'undefined' &&
            typeof localStorage !== 'undefined'
        ) {
            localStorage.setItem('currentUser', JSON.stringify(user))
        }
    }

    private removeUserFromStorage(): void {
        if (
            typeof window !== 'undefined' &&
            typeof localStorage !== 'undefined'
        ) {
            localStorage.removeItem('currentUser')
        }
    }

    login(loginRequest: LoginRequest): Observable<User> {
        // Simulate login - in real app, this would call backend API
        const user = this.mockUsers.find(u => u.email === loginRequest.email)

        if (user) {
            // Simulate password check (in real app, backend would handle this)
            this.setUserInStorage(user)
            this.currentUserSubject.next(user)
            return of(user).pipe(delay(1000))
        } else {
            return throwError(() => new Error('Invalid email or password'))
        }
    }

    register(registerRequest: RegisterRequest): Observable<User> {
        // Check if user already exists
        const existingUser = this.mockUsers.find(
            u => u.email === registerRequest.email
        )
        if (existingUser) {
            return throwError(
                () => new Error('User with this email already exists')
            )
        }

        // Create new user
        const newUser: User = {
            id: `user${this.mockUsers.length + 1}`,
            email: registerRequest.email,
            name: registerRequest.name,
            phone: registerRequest.phone,
            createdAt: new Date(),
            isAdmin: false,
        }

        this.mockUsers.push(newUser)
        this.setUserInStorage(newUser)
        this.currentUserSubject.next(newUser)

        return of(newUser).pipe(delay(1000))
    }

    logout(): void {
        this.removeUserFromStorage()
        this.currentUserSubject.next(null)
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value
    }

    isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null
    }

    isAdmin(): boolean {
        const user = this.currentUserSubject.value
        return user?.isAdmin || false
    }

    // Mock login for demo purposes
    mockLogin(userType: 'user' | 'admin' = 'user'): Observable<User> {
        const user =
            userType === 'admin'
                ? this.mockUsers.find(u => u.isAdmin)!
                : this.mockUsers.find(u => !u.isAdmin)!

        this.setUserInStorage(user)
        this.currentUserSubject.next(user)
        return of(user).pipe(delay(500))
    }
}
