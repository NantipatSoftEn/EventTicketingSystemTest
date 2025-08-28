# API Versioning Migration Guide

This document explains the API versioning implementation and migration from the previous unversioned API.

## Overview

The Event Ticketing System API now supports versioning using URL-based versioning strategy. This allows for:

- **Backward Compatibility**: Existing clients continue to work with v1
- **Scalability**: Easy addition of new API versions (v2, v3, etc.)
- **Clear Deprecation Path**: Ability to deprecate old versions gracefully
- **Feature Isolation**: Version-specific features without breaking existing functionality

## API Structure

### Before (Unversioned)
```
GET /api/users
POST /api/events
GET /api/bookings/user/1
```

### After (Versioned)
```
GET /api/v1/users
POST /api/v1/events  
GET /api/v1/bookings/user/1
```

## Endpoint Mapping

| New Endpoint | Notes |
|-------------|-------|
| `GET /api/v1/users` | List all users |
| `POST /api/v1/users` | Create user |
| `GET /api/v1/users/{id}` | Get user by ID |
| `GET /api/v1/events` | List all events |
| `POST /api/v1/events` | Create event |
| `GET /api/v1/events/{id}` | Get event by ID |
| `PUT /api/v1/events/{id}` | Update event |
| `DELETE /api/v1/events/{id}` | Delete event (admin only) |
| `POST /api/v1/bookings` | Create booking |
| `GET /api/v1/bookings/user/{id}` | Get user bookings |
| `GET /api/v1/bookings/event/{id}` | Get event bookings |
| `PUT /api/v1/bookings/{id}/status` | Update booking status |

## New Endpoints

### Version Information
- `GET /api` - Returns available API versions and information

### Architecture Information  
- `GET /api/v1/architecture` - Returns clean architecture details

## Response Format

All API endpoints now return a standardized response format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Actual response data
  }
}
```

### Success Response Example
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "0812345678",
    "role": "customer"
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

### List Response Example
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "0812345678",
      "role": "customer"
    }
  ]
}
```

## Migration Steps for Frontend

1. **Update Base URL**: Change from `/api/` to `/api/v1/`
2. **Update Response Handling**: Expect the new response format with `success`, `message`, and `data` fields
3. **Error Handling**: Update error handling to use the new standardized error format

### Frontend Code Example (Before)
```typescript
// Old way
const response = await fetch('/api/users');
const users = await response.json(); // Direct array

// Handle errors
if (!response.ok) {
  // Handle different error formats
}
```

### Frontend Code Example (After)
```typescript
// New way
const response = await fetch('/api/v1/users');
const result = await response.json();

if (result.success) {
  const users = result.data; // Array is in data field
} else {
  console.error(result.message); // Standardized error message
}
```

## API Version Management

### Current Versions
- **v1**: Current stable version with all existing functionality

### Future Versions
- **v2**: Planned features (future implementation)
  - Enhanced authentication
  - Advanced filtering and pagination
  - Webhook support
  - Real-time notifications

### Version Discovery
Use `GET /api` to discover available versions:

```json
{
  "success": true,
  "message": "API version information retrieved successfully",
  "data": {
    "available_versions": ["v1"],
    "default_version": "v1",
    "current_version_url": "/api/v1",
    "documentation": {
      "v1": "/docs"
    }
  }
}
```

## Benefits of This Implementation

1. **Backward Compatibility**: Existing v1 clients continue to work
2. **Clear Migration Path**: Easy to identify what needs updating
3. **Feature Isolation**: New features can be added to v2 without affecting v1
4. **Deprecation Strategy**: Old versions can be deprecated with clear timelines
5. **Client Flexibility**: Clients can choose when to migrate to newer versions

## Development Guidelines

### Adding New Versions
1. Create new directory: `src/presentation/api/v2/`
2. Copy and modify endpoints from v1
3. Update main router to include v2
4. Update version list in `versioning.py`

### Breaking Changes
- Only introduce in new major versions
- Maintain backward compatibility in existing versions
- Provide clear migration documentation

### Non-Breaking Changes
- Can be added to existing versions
- Should not change existing endpoint behavior
- Should be additive only

## Testing

### Test Version-Specific Endpoints
```bash
# Test v1 endpoints
curl http://localhost:8000/api/v1/users
curl http://localhost:8000/api/v1/events

# Test version discovery
curl http://localhost:8000/api
```

### Response Format Validation
Ensure all endpoints return the standardized format:
- `success`: boolean
- `message`: string  
- `data`: object or array

This versioning strategy provides a solid foundation for scaling the API while maintaining backward compatibility and clear migration paths.
