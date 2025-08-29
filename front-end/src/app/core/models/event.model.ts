export interface Event {
    id: number
    title: string
    description: string
    venue: string
    date: Date
    time: string
    price: number
    totalTickets: number
    availableTickets: number
    image: string
    isActive: boolean
    createdAt: Date
}

export interface EventManagement {
    id: number
    title: string
    description: string
    venue: string
    date_time: string
    capacity: number
    price: string
    status: string
    created_at: string
    total_tickets_sold: number
    available_tickets: number
    total_revenue: string
    total_bookings: number
    occupancy_percentage: number
    potential_revenue: string
}

export interface EventFilters {
    search?: string
    venue?: string
    dateFrom?: Date
    dateTo?: Date
}
