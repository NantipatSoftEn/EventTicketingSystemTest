export interface Booking {
    id: string
    userId: number
    eventId: number
    quantity: number
    totalAmount: number
    status: BookingStatus
    bookingDate: Date
    tickets: Ticket[]
    event?: Event
    user?: User
}

export interface Ticket {
    id: string
    bookingId: string
    ticketCode: string
    status: TicketStatus
    createdAt: Date
}

export interface BookingRequest {
    eventId: number
    userId: number
    quantity: number
    userName: string
    userPhone?: string
}

export interface BookingApiRequest {
    user_id: number
    event_id: number
    quantity: number
}

export enum BookingStatus {
    CONFIRMED = 'active', // hotfix
    CANCELLED = 'cancelled',
    PENDING = 'pending',
}

export enum TicketStatus {
    VALID = 'valid',
    USED = 'used',
    CANCELLED = 'cancelled',
}

// Import dependencies (will be added when Event and User models are created)
import { Event } from './event.model'
import { User } from './user.model'
