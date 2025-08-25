export interface Event {
  id: number;
  title: string;
  description: string;
  venue: string;
  date: Date;
  availableTickets: number;
  totalTickets: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  venue: string;
  date: Date;
  totalTickets: number;
  price: number;
}

export interface EventSearchFilter {
  query?: string;
  venue?: string;
  startDate?: Date;
  endDate?: Date;
}
