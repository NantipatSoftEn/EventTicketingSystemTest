    async def get_events_for_management(self) -> List[EventManagementSchema]:
        """Get all events with statistics for management table view"""
        events = await self._event_use_cases.get_events_for_management()
        
        return [
            EventManagementSchema(
                id=event.id,
                title=event.title,
                description=event.description,
                venue=event.venue,
                date_time=event.date_time,
                capacity=event.capacity,
                price=event.price,
                status=event.status,
                created_at=event.created_at,
                total_tickets_sold=event.total_tickets_sold,
                available_tickets=event.available_tickets,
                total_revenue=event.total_revenue,
                total_bookings=event.total_bookings,
                occupancy_percentage=event.occupancy_percentage,
                potential_revenue=event.potential_revenue
            )
            for event in events
        ]
