export interface Event {
  id: number;
  title: string;
  description: string;
  venue: string;
  date: Date;
  time: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
  image: string;
  isActive: boolean;
  createdAt: Date;
}

export interface EventFilters {
  search?: string;
  venue?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
