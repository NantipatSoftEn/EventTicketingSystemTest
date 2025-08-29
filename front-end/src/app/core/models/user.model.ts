export interface User {
    id: string
    email: string
    name: string
    phone?: string
    createdAt: Date
    isAdmin: boolean
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    name: string
    phone?: string
}
