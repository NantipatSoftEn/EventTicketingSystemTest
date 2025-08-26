"""
API versioning utilities
"""

from fastapi import APIRouter, Request, HTTPException, status
from src.presentation.schemas.api_response_schemas import ApiResponse

# Available API versions
API_VERSIONS = ["v1"]
DEFAULT_VERSION = "v1"


def get_api_version_from_path(request: Request) -> str:
    """Extract API version from request path"""
    path_parts = request.url.path.strip("/").split("/")
    
    if len(path_parts) >= 2 and path_parts[0] == "api":
        version = path_parts[1]
        if version in API_VERSIONS:
            return version
    
    return DEFAULT_VERSION


def create_version_info_endpoint():
    """Create an endpoint that shows available API versions"""
    router = APIRouter()
    
    @router.get("/api", response_model=ApiResponse[dict])
    async def get_api_versions():
        """Get available API versions"""
        data = {
            "available_versions": API_VERSIONS,
            "default_version": DEFAULT_VERSION,
            "current_version_url": "/api/v1",
            "documentation": {
                "v1": "/docs"
            }
        }
        return ApiResponse.success_response(
            data=data,
            message="API version information retrieved successfully"
        )
    
    return router
