from dataclasses import dataclass
from typing import Optional
from ...domain.entities.user import UserRole


@dataclass
class UserCreateDTO:
    """DTO for creating a new user"""
    name: str
    phone: str
    role: UserRole = UserRole.CUSTOMER


@dataclass  
class UserResponseDTO:
    """DTO for user response"""
    id: int
    name: str
    phone: str
    role: UserRole
