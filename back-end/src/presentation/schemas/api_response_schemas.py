"""
Standard API Response Schemas
Provides consistent response format for all API endpoints
"""

from typing import Any, TypeVar, Generic, Optional
from pydantic import BaseModel

T = TypeVar('T')


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response format"""
    success: bool
    message: str
    data: Optional[T] = None
    
    @classmethod
    def success_response(cls, data: T, message: str = "Operation successful") -> "ApiResponse[T]":
        """Create a successful response"""
        return cls(
            success=True,
            message=message,
            data=data
        )
    
    @classmethod
    def error_response(cls, message: str, data: Optional[T] = None) -> "ApiResponse[T]":
        """Create an error response"""
        return cls(
            success=False,
            message=message,
            data=data
        )


class ApiListResponse(BaseModel, Generic[T]):
    """Standard API response format for list endpoints"""
    success: bool
    message: str
    data: list[T]
    
    @classmethod
    def success_response(cls, data: list[T], message: str = "Operation successful") -> "ApiListResponse[T]":
        """Create a successful list response"""
        return cls(
            success=True,
            message=message,
            data=data
        )
    
    @classmethod
    def error_response(cls, message: str, data: Optional[list[T]] = None) -> "ApiListResponse[T]":
        """Create an error list response"""
        return cls(
            success=False,
            message=message,
            data=data or []
        )


# Response types for different data models
class UserApiResponse(ApiResponse[dict]):
    """API response for user data"""
    pass


class EventApiResponse(ApiResponse[dict]):
    """API response for event data"""
    pass


class BookingApiResponse(ApiResponse[dict]):
    """API response for booking data"""
    pass


class UserListApiResponse(ApiListResponse[dict]):
    """API response for user list data"""
    pass


class EventListApiResponse(ApiListResponse[dict]):
    """API response for event list data"""
    pass


class EventManagementApiResponse(ApiListResponse[dict]):
    """API response for event management data with statistics"""
    pass


class BookingListApiResponse(ApiListResponse[dict]):
    """API response for booking list data"""
    pass
