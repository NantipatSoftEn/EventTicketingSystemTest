"""
Users API v1 endpoints
"""

from typing import List
from fastapi import APIRouter, HTTPException, status
from src.presentation.schemas.user_schemas import UserCreateSchema, UserResponseSchema
from src.presentation.schemas.api_response_schemas import UserApiResponse, UserListApiResponse, ApiResponse, ApiListResponse
from src.presentation.utils.response_utils import prepare_response_data
from src.container import container

router = APIRouter()


@router.post("", response_model=UserApiResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreateSchema):
    """Create a new user"""
    user = await container.user_controller.create_user(user_data)
    return ApiResponse.success_response(
        data=prepare_response_data(user),
        message="User created successfully"
    )


@router.get("", response_model=UserListApiResponse)
async def list_users():
    """Get all users"""
    users = await container.user_controller.get_all_users()
    return ApiListResponse.success_response(
        data=prepare_response_data(users),
        message="Users retrieved successfully"
    )


@router.get("/{user_id}", response_model=UserApiResponse)
async def get_user(user_id: int):
    """Get user by ID"""
    user = await container.user_controller.get_user_by_id(user_id)
    return ApiResponse.success_response(
        data=prepare_response_data(user),
        message="User retrieved successfully"
    )
