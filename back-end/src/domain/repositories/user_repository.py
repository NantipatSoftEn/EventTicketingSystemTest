from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.user import User


class UserRepository(ABC):
    """Abstract repository interface for User entity"""
    
    @abstractmethod
    async def create(self, user: User) -> User:
        """Create a new user"""
        pass
    
    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        pass
    
    @abstractmethod
    async def get_by_phone(self, phone: str) -> Optional[User]:
        """Get user by phone number"""
        pass
    
    @abstractmethod
    async def get_all(self) -> List[User]:
        """Get all users"""
        pass
    
    @abstractmethod
    async def update(self, user: User) -> User:
        """Update existing user"""
        pass
    
    @abstractmethod
    async def delete(self, user_id: int) -> bool:
        """Delete user by ID"""
        pass
    
    @abstractmethod
    async def exists_by_phone(self, phone: str) -> bool:
        """Check if user exists by phone"""
        pass
