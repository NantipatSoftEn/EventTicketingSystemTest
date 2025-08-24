"""
Dependency injection container for clean architecture
This module wires up all the dependencies following clean architecture principles
"""

from src.infrastructure.database.connection import init_db, close_db

# Infrastructure - Repositories
from src.infrastructure.repositories.user_repository_impl import UserRepositoryImpl
from src.infrastructure.repositories.event_repository_impl import EventRepositoryImpl
from src.infrastructure.repositories.booking_repository_impl import BookingRepositoryImpl
from src.infrastructure.repositories.ticket_repository_impl import TicketRepositoryImpl

# Domain - Services
from src.domain.services.booking_service import BookingService
from src.domain.services.ticket_service_impl import TicketService

# Application - Use Cases
from src.application.use_cases.user_use_cases import UserUseCases
from src.application.use_cases.event_use_cases import EventUseCases
from src.application.use_cases.booking_use_cases import BookingUseCases

# Presentation - Controllers
from src.presentation.controllers.user_controller import UserController
from src.presentation.controllers.event_controller import EventController
from src.presentation.controllers.booking_controller import BookingController


class DependencyContainer:
    """Dependency injection container"""
    
    def __init__(self):
        # Initialize repositories
        self.user_repository = UserRepositoryImpl()
        self.event_repository = EventRepositoryImpl()
        self.booking_repository = BookingRepositoryImpl()
        self.ticket_repository = TicketRepositoryImpl()
        
        # Initialize domain services
        self.booking_service = BookingService(
            self.booking_repository,
            self.event_repository
        )
        self.ticket_service = TicketService(self.ticket_repository)
        
        # Initialize use cases
        self.user_use_cases = UserUseCases(self.user_repository)
        self.event_use_cases = EventUseCases(self.event_repository)
        self.booking_use_cases = BookingUseCases(
            self.booking_repository,
            self.user_repository,
            self.event_repository,
            self.ticket_repository,
            self.booking_service,
            self.ticket_service
        )
        
        # Initialize controllers
        self.user_controller = UserController(self.user_use_cases)
        self.event_controller = EventController(self.event_use_cases, self.user_use_cases)
        self.booking_controller = BookingController(self.booking_use_cases, self.user_use_cases)


# Global container instance
container = DependencyContainer()
