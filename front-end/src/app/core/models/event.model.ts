export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  date: Date;
  time: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
  image: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
}

export interface EventFilters {
  search?: string;
  venue?: string;
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
}
