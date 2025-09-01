# Travel Pins API Specification

This document defines the complete API interface specification for the Travel Pins backend implementation. This specification is based on the current frontend implementation and provides all necessary endpoints, request/response structures, and technical requirements.

## 🎯 Overview

The Travel Pins API provides endpoints for managing user travel pins on an interactive map, including full CRUD operations, photo management, and user authentication integration.

## 📋 Base Configuration

- **Base URL**: `{API_BASE_URL}/api/travel-pins`
- **Authentication**: Bearer token (existing user authentication system)
- **Content-Type**: `application/json`
- **API Version**: v1

## 🗃️ Data Models

### TravelPin Model
```json
{
  "id": "integer (primary key, auto-increment)",
  "user_id": "integer (foreign key to users table)",
  "title": "string (max 255 characters, required)",
  "note": "text (supports markdown, optional)",
  "latitude": "decimal(10,8) (required, -90 to 90)",
  "longitude": "decimal(11,8) (required, -180 to 180)",
  "visited_at": "date (ISO 8601 format, required)",
  "photo_url": "string (max 2048 characters, optional)",
  "created_at": "timestamp (ISO 8601 format, auto-generated)",
  "updated_at": "timestamp (ISO 8601 format, auto-generated)"
}
```

### Frontend Pin Object (for reference)
```javascript
{
  id: number,
  title: string,
  note: string,
  coordinates: [longitude, latitude], // GeoJSON format: [lng, lat]
  visited_at: string, // ISO 8601 date string
  photo_url: string // Optional external photo URL
}
```

## 🔌 API Endpoints

### 1. Get All User Travel Pins
**GET** `/api/travel-pins`

**Description**: Retrieve all travel pins for the authenticated user

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Query Parameters**: None

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Taipei 101",
      "note": "Amazing **skyscraper** with great views! [Official Site](https://taipei-101.com)",
      "latitude": 25.033964,
      "longitude": 121.564472,
      "visited_at": "2024-03-15",
      "photo_url": "https://example.com/taipei101.jpg",
      "created_at": "2024-03-15T10:30:00Z",
      "updated_at": "2024-03-15T10:30:00Z"
    },
    {
      "id": 2,
      "title": "Sun Moon Lake",
      "note": "Beautiful lake with peaceful atmosphere",
      "latitude": 23.857058,
      "longitude": 120.915473,
      "visited_at": "2024-02-20",
      "photo_url": null,
      "created_at": "2024-02-20T14:20:00Z",
      "updated_at": "2024-02-20T14:20:00Z"
    }
  ],
  "meta": {
    "total_count": 2
  }
}
```

**Error Response**: `401 Unauthorized`
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 2. Create New Travel Pin
**POST** `/api/travel-pins`

**Description**: Create a new travel pin for the authenticated user

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Taipei 101",
  "note": "Amazing **skyscraper** with great views! [Official Site](https://taipei-101.com)",
  "latitude": 25.033964,
  "longitude": 121.564472,
  "visited_at": "2024-03-15",
  "photo_url": "https://example.com/taipei101.jpg"
}
```

**Required Fields**:
- `title` (string, 1-255 characters)
- `latitude` (decimal, -90 to 90)
- `longitude` (decimal, -180 to 180)
- `visited_at` (ISO 8601 date string)

**Optional Fields**:
- `note` (string, supports markdown)
- `photo_url` (string, valid URL, max 2048 characters)

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "Taipei 101",
    "note": "Amazing **skyscraper** with great views! [Official Site](https://taipei-101.com)",
    "latitude": 25.033964,
    "longitude": 121.564472,
    "visited_at": "2024-03-15",
    "photo_url": "https://example.com/taipei101.jpg",
    "created_at": "2024-03-15T10:30:00Z",
    "updated_at": "2024-03-15T10:30:00Z"
  }
}
```

**Error Response**: `422 Unprocessable Entity`
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": ["Title is required"],
      "latitude": ["Latitude must be between -90 and 90"],
      "longitude": ["Longitude must be between -180 and 180"],
      "visited_at": ["Invalid date format, use ISO 8601"]
    }
  }
}
```

### 3. Get Single Travel Pin
**GET** `/api/travel-pins/{id}`

**Description**: Retrieve a specific travel pin by ID (user must own the pin)

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Path Parameters**:
- `id` (integer): Travel pin ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Taipei 101",
    "note": "Amazing **skyscraper** with great views!",
    "latitude": 25.033964,
    "longitude": 121.564472,
    "visited_at": "2024-03-15",
    "photo_url": "https://example.com/taipei101.jpg",
    "created_at": "2024-03-15T10:30:00Z",
    "updated_at": "2024-03-15T10:30:00Z"
  }
}
```

**Error Response**: `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Travel pin not found or access denied"
  }
}
```

### 4. Update Travel Pin
**PUT** `/api/travel-pins/{id}`

**Description**: Update an existing travel pin (user must own the pin)

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Path Parameters**:
- `id` (integer): Travel pin ID

**Request Body** (all fields optional, only provided fields will be updated):
```json
{
  "title": "Updated Taipei 101",
  "note": "Updated description with **markdown**",
  "latitude": 25.033965,
  "longitude": 121.564473,
  "visited_at": "2024-03-16",
  "photo_url": "https://example.com/new-taipei101.jpg"
}
```

**Validation Rules**:
- `title`: 1-255 characters if provided
- `latitude`: -90 to 90 if provided
- `longitude`: -180 to 180 if provided
- `visited_at`: Valid ISO 8601 date if provided
- `photo_url`: Valid URL or null if provided

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Taipei 101",
    "note": "Updated description with **markdown**",
    "latitude": 25.033965,
    "longitude": 121.564473,
    "visited_at": "2024-03-16",
    "photo_url": "https://example.com/new-taipei101.jpg",
    "created_at": "2024-03-15T10:30:00Z",
    "updated_at": "2024-03-16T09:45:00Z"
  }
}
```

### 5. Delete Travel Pin
**DELETE** `/api/travel-pins/{id}`

**Description**: Delete a travel pin (user must own the pin)

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Path Parameters**:
- `id` (integer): Travel pin ID

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Travel pin deleted successfully"
}
```

**Error Response**: `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Travel pin not found or access denied"
  }
}
```

## 🗄️ Database Schema

### travel_pins Table
```sql
CREATE TABLE travel_pins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    note TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    visited_at DATE NOT NULL,
    photo_url VARCHAR(2048),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_coordinates (latitude, longitude),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔒 Authentication & Authorization

### Authentication Method
- **Type**: Bearer Token (consistent with existing system)
- **Header**: `Authorization: Bearer {access_token}`
- **Validation**: Token must be valid and not expired

### Authorization Rules
- Users can only access their own travel pins
- All endpoints require authentication
- Cross-user access should return 404 (not 403) for security

### User Context
The backend should extract the `user_id` from the authenticated token and use it for:
- Filtering pins in GET requests
- Setting ownership in POST requests
- Validating ownership in PUT/DELETE requests

## 📝 Validation Rules

### Coordinate Validation
```javascript
// Latitude: -90 to 90 (decimal degrees)
latitude >= -90 && latitude <= 90

// Longitude: -180 to 180 (decimal degrees)
longitude >= -180 && longitude <= 180
```

### Date Validation
```javascript
// ISO 8601 date format: YYYY-MM-DD
visited_at: /^\d{4}-\d{2}-\d{2}$/

// Must be a valid date
const date = new Date(visited_at);
date.toString() !== 'Invalid Date'
```

### String Validation
```javascript
// Title: required, 1-255 characters
title.length >= 1 && title.length <= 255

// Note: optional, supports markdown
// No specific length limit, but recommend reasonable limit (e.g., 10000 chars)

// Photo URL: optional, valid URL format, max 2048 characters
photo_url === null || (isValidURL(photo_url) && photo_url.length <= 2048)
```

## 🚨 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Error Codes
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `NOT_FOUND` (404): Resource not found or access denied
- `VALIDATION_ERROR` (422): Request data validation failed
- `INTERNAL_ERROR` (500): Server error

### Validation Error Details
For validation errors, include field-specific messages:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field_name": ["Error message 1", "Error message 2"],
      "another_field": ["Error message"]
    }
  }
}
```

## 🎯 Frontend Integration Notes

### Coordinate System
- **Frontend**: Uses GeoJSON format `[longitude, latitude]`
- **Backend**: Stores as separate `latitude` and `longitude` fields
- **Conversion**: Frontend must swap coordinates when sending/receiving

### Date Handling
- **Format**: ISO 8601 date strings (YYYY-MM-DD)
- **Timezone**: Dates are date-only, no time component needed
- **Frontend**: Uses HTML date input format

### Markdown Support
- **Storage**: Backend stores raw markdown text
- **Rendering**: Frontend handles markdown-to-HTML conversion
- **Sanitization**: Backend should validate but not process markdown

### Photo URLs
- **External Links**: Users provide external photo URLs
- **Validation**: Backend validates URL format
- **Future**: Can be extended for file upload integration

## 🔧 Implementation Considerations

### Performance
- Index on `user_id` for fast user-specific queries
- Index on coordinates for potential geo-spatial queries
- Consider pagination for users with many pins

### Security
- Validate all input data
- Prevent SQL injection with parameterized queries
- Rate limiting on API endpoints
- CORS configuration for frontend domain

### Scalability
- Current design supports per-user pin collections
- Database schema allows for future features (categories, sharing, etc.)
- API design allows for filtering/pagination extensions

### Future Extensions
The API design supports these potential features:
- Pin categories/tags
- Public/private pin visibility
- Pin sharing between users
- Geo-spatial queries (nearby pins)
- Pin clustering for performance
- Bulk operations (import/export)

## 📋 Testing Checklist

### Authentication Tests
- [ ] Valid token access
- [ ] Invalid token rejection
- [ ] Missing token rejection
- [ ] Expired token handling

### CRUD Operations Tests
- [ ] Create pin with valid data
- [ ] Create pin with invalid data
- [ ] Get all pins for user
- [ ] Get single pin by ID
- [ ] Update pin with valid data
- [ ] Update pin with invalid data
- [ ] Delete existing pin
- [ ] Delete non-existent pin

### Authorization Tests
- [ ] User can only access own pins
- [ ] User cannot access other user's pins
- [ ] Proper 404 responses for unauthorized access

### Data Validation Tests
- [ ] Coordinate boundary validation
- [ ] Date format validation
- [ ] String length validation
- [ ] URL format validation

## 🚀 Deployment Requirements

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# API
API_BASE_URL=https://your-api-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

### API Documentation
- Consider using Swagger/OpenAPI for interactive API documentation
- Include this specification in the API documentation
- Provide Postman collection for testing

---

*This specification provides a complete blueprint for implementing the Travel Pins backend API. The backend team can use this as a comprehensive guide for implementation, ensuring perfect compatibility with the existing frontend.*