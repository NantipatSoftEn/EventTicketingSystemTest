from typing import List, Optional
from ...domain.entities.user import User
from ...domain.repositories.user_repository import UserRepository
from ..database.models.user_model import UserModel


class UserRepositoryImpl(UserRepository):
    """Tortoise ORM implementation of UserRepository"""
    
    async def create(self, user: User) -> User:
        """Create a new user"""
        user_model = await UserModel.create(
            name=user.name,
            phone=user.phone,
            role=user.role
        )
        
        return User(
            id=user_model.id,
            name=user_model.name,
            phone=user_model.phone,
            role=user_model.role
        )
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        user_model = await UserModel.get_or_none(id=user_id)
        if not user_model:
            return None
        
        return User(
            id=user_model.id,
            name=user_model.name,
            phone=user_model.phone,
            role=user_model.role
        )
    
    async def get_by_phone(self, phone: str) -> Optional[User]:
        """Get user by phone number"""
        user_model = await UserModel.get_or_none(phone=phone)
        if not user_model:
            return None
        
        return User(
            id=user_model.id,
            name=user_model.name,
            phone=user_model.phone,
            role=user_model.role
        )
    
    async def get_all(self) -> List[User]:
        """Get all users"""
        user_models = await UserModel.all()
        
        return [
            User(
                id=user_model.id,
                name=user_model.name,
                phone=user_model.phone,
                role=user_model.role
            )
            for user_model in user_models
        ]
    
    async def update(self, user: User) -> User:
        """Update existing user"""
        user_model = await UserModel.get(id=user.id)
        user_model.name = user.name
        user_model.phone = user.phone
        user_model.role = user.role
        await user_model.save()
        
        return User(
            id=user_model.id,
            name=user_model.name,
            phone=user_model.phone,
            role=user_model.role
        )
    
    async def delete(self, user_id: int) -> bool:
        """Delete user by ID"""
        user_model = await UserModel.get_or_none(id=user_id)
        if not user_model:
            return False
        
        await user_model.delete()
        return True
    
    async def exists_by_phone(self, phone: str) -> bool:
        """Check if user exists by phone"""
        return await UserModel.filter(phone=phone).exists()
