from dataclasses import dataclass
from enum import Enum
from typing import Optional


class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"


@dataclass
class User:
    """User domain entity representing customers and admins"""
    id: Optional[int]
    name: str
    phone: str
    role: UserRole
    
    def __post_init__(self):
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("User name cannot be empty")
        
        if not self.phone or len(self.phone.strip()) == 0:
            raise ValueError("User phone cannot be empty")
        
        if len(self.phone) < 10:
            raise ValueError("Phone number must be at least 10 characters")
    
    def is_admin(self) -> bool:
        """Check if user has admin role"""
        return self.role == UserRole.ADMIN
    
    def is_customer(self) -> bool:
        """Check if user has customer role"""
        return self.role == UserRole.CUSTOMER
