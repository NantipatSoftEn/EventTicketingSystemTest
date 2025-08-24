from typing import List
from fastapi import HTTPException, status
from ...application.use_cases.user_use_cases import UserUseCases
from ...application.dtos.user_dto import UserCreateDTO, UserResponseDTO
from ..schemas.user_schemas import UserCreateSchema, UserResponseSchema


class UserController:
    """Controller for user-related endpoints"""
    
    def __init__(self, user_use_cases: UserUseCases):
        self._user_use_cases = user_use_cases
    
    async def create_user(self, user_schema: UserCreateSchema) -> UserResponseSchema:
        """Create a new user"""
        try:
            user_dto = UserCreateDTO(
                name=user_schema.name,
                phone=user_schema.phone,
                role=user_schema.role
            )
            
            created_user = await self._user_use_cases.create_user(user_dto)
            
            return UserResponseSchema(
                id=created_user.id,
                name=created_user.name,
                phone=created_user.phone,
                role=created_user.role
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    
    async def get_user_by_id(self, user_id: int) -> UserResponseSchema:
        """Get user by ID"""
        try:
            user = await self._user_use_cases.get_user_by_id(user_id)
            
            return UserResponseSchema(
                id=user.id,
                name=user.name,
                phone=user.phone,
                role=user.role
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
    
    async def get_all_users(self) -> List[UserResponseSchema]:
        """Get all users"""
        users = await self._user_use_cases.get_all_users()
        
        return [
            UserResponseSchema(
                id=user.id,
                name=user.name,
                phone=user.phone,
                role=user.role
            )
            for user in users
        ]
