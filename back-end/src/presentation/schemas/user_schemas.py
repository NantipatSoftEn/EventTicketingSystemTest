from pydantic import BaseModel, Field
from ...domain.entities.user import UserRole


class UserCreateSchema(BaseModel):
    """Pydantic schema for creating a new user"""
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    role: UserRole = UserRole.CUSTOMER


class UserResponseSchema(BaseModel):
    """Pydantic schema for user response"""
    id: int
    name: str
    phone: str
    role: UserRole
    
    class Config:
        from_attributes = True
