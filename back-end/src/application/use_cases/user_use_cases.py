from typing import List
from datetime import datetime
from ...domain.entities.user import User, UserRole
from ...domain.repositories.user_repository import UserRepository
from ..dtos.user_dto import UserCreateDTO, UserResponseDTO


class UserUseCases:
    """Application use cases for user operations"""
    
    def __init__(self, user_repository: UserRepository):
        self._user_repository = user_repository
    
    async def create_user(self, user_dto: UserCreateDTO) -> UserResponseDTO:
        """Create a new user"""
        # Check if phone already exists
        existing_user = await self._user_repository.get_by_phone(user_dto.phone)
        if existing_user:
            raise ValueError("Phone number already registered")
        
        # Create domain entity
        user = User(
            id=None,
            name=user_dto.name,
            phone=user_dto.phone,
            role=user_dto.role
        )
        
        # Save user
        created_user = await self._user_repository.create(user)
        
        # Return DTO
        return UserResponseDTO(
            id=created_user.id,
            name=created_user.name,
            phone=created_user.phone,
            role=created_user.role
        )
    
    async def get_user_by_id(self, user_id: int) -> UserResponseDTO:
        """Get user by ID"""
        user = await self._user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        return UserResponseDTO(
            id=user.id,
            name=user.name,
            phone=user.phone,
            role=user.role
        )
    
    async def get_all_users(self) -> List[UserResponseDTO]:
        """Get all users"""
        users = await self._user_repository.get_all()
        
        return [
            UserResponseDTO(
                id=user.id,
                name=user.name,
                phone=user.phone,
                role=user.role
            )
            for user in users
        ]
    
    async def validate_admin_access(self, user_id: int) -> None:
        """Validate that user has admin access"""
        user = await self._user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        if not user.is_admin():
            raise ValueError("Admin access required")
