# Travel Pins API Guide for Frontend

This document provides all the information frontend developers need to integrate with the Travel Pins API.

## 🌐 Base URL

```
{API_BASE_URL}/api/v1/travel-pins
```

## 🔑 Authentication

- **Authentication Method**: Bearer Token (Laravel Sanctum)
- **Header**: `Authorization: Bearer {access_token}`
- **Public Endpoints**: GET requests (no authentication required)
- **Protected Endpoints**: POST, PUT, DELETE requests (authentication required)

## 📋 Data Model

### TravelPin Object
```typescript
interface TravelPin {
  id: number;
  title: string;
  note: string | null;
  latitude: string; // decimal string with 8 decimal places
  longitude: string; // decimal string with 8 decimal places
  visited_at: string; // ISO date format: "YYYY-MM-DD"
  photo_url: string | null;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}
```

## 🔌 API Endpoints

### 1. Get All Travel Pins
**GET** `/api/v1/travel-pins`

- **Authentication**: None required ✅ Public
- **Description**: Retrieve all travel pins from all users

```typescript
// Request
fetch('/api/v1/travel-pins')

// Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "title": "Taipei 101",
      "note": "Amazing **skyscraper** with great views!",
      "latitude": "25.03396400",
      "longitude": "121.56447200",
      "visited_at": "2024-03-15",
      "photo_url": "https://example.com/taipei101.jpg",
      "created_at": "2024-03-15T10:30:00.000000Z",
      "updated_at": "2024-03-15T10:30:00.000000Z"
    }
    // ... more pins
  ]
}
```

### 2. Get Single Travel Pin
**GET** `/api/v1/travel-pins/{id}`

- **Authentication**: None required ✅ Public
- **Description**: Retrieve a specific travel pin by ID

```typescript
// Request
fetch('/api/v1/travel-pins/1')

// Response: 200 OK
{
  "data": {
    "id": 1,
    "title": "Taipei 101",
    "note": "Amazing **skyscraper** with great views!",
    "latitude": "25.03396400",
    "longitude": "121.56447200",
    "visited_at": "2024-03-15",
    "photo_url": "https://example.com/taipei101.jpg",
    "created_at": "2024-03-15T10:30:00.000000Z",
    "updated_at": "2024-03-15T10:30:00.000000Z"
  }
}

// Error: 404 Not Found
{
  "message": "No query results for model [App\\Models\\TravelPin]."
}
```

### 3. Create New Travel Pin
**POST** `/api/v1/travel-pins`

- **Authentication**: Required 🔒
- **Description**: Create a new travel pin (user must be authenticated)

```typescript
// Request
fetch('/api/v1/travel-pins', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {access_token}'
  },
  body: JSON.stringify({
    title: "Taipei 101",
    note: "Amazing **skyscraper** with great views!",
    latitude: 25.033964,
    longitude: 121.564472,
    visited_at: "2024-03-15",
    photo_url: "https://example.com/taipei101.jpg" // optional
  })
})

// Response: 201 Created
{
  "data": {
    "id": 3,
    "title": "Taipei 101",
    "note": "Amazing **skyscraper** with great views!",
    "latitude": "25.03396400",
    "longitude": "121.56447200",
    "visited_at": "2024-03-15",
    "photo_url": "https://example.com/taipei101.jpg",
    "created_at": "2024-03-15T10:30:00.000000Z",
    "updated_at": "2024-03-15T10:30:00.000000Z"
  }
}
```

### 4. Update Travel Pin
**PUT** `/api/v1/travel-pins/{id}`

- **Authentication**: Required 🔒
- **Authorization**: User must own the pin
- **Description**: Update an existing travel pin

```typescript
// Request (partial update - only provided fields will be updated)
fetch('/api/v1/travel-pins/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {access_token}'
  },
  body: JSON.stringify({
    title: "Updated Taipei 101",
    note: "Updated description with **markdown**"
    // Other fields remain unchanged
  })
})

// Response: 200 OK
{
  "data": {
    "id": 1,
    "title": "Updated Taipei 101",
    "note": "Updated description with **markdown**",
    "latitude": "25.03396400",
    "longitude": "121.56447200",
    "visited_at": "2024-03-15",
    "photo_url": "https://example.com/taipei101.jpg",
    "created_at": "2024-03-15T10:30:00.000000Z",
    "updated_at": "2024-03-16T09:45:00.000000Z"
  }
}
```

### 5. Delete Travel Pin
**DELETE** `/api/v1/travel-pins/{id}`

- **Authentication**: Required 🔒
- **Authorization**: User must own the pin
- **Description**: Delete a travel pin

```typescript
// Request
fetch('/api/v1/travel-pins/1', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer {access_token}'
  }
})

// Response: 204 No Content
// (No response body)
```

## ✅ Validation Rules

### Required Fields (POST)
- `title`: string, 1-255 characters
- `latitude`: number, -90 to 90
- `longitude`: number, -180 to 180
- `visited_at`: string, date format "YYYY-MM-DD"

### Optional Fields
- `note`: string, supports Markdown
- `photo_url`: string, valid URL, max 2048 characters

### Update Fields (PUT)
All fields are optional - only provided fields will be updated.

## 🚨 Error Handling

### Authentication Errors
```typescript
// 401 Unauthorized (missing/invalid token)
{
  "message": "Unauthenticated."
}
```

### Authorization Errors
```typescript
// 403 Forbidden (trying to modify another user's pin)
{
  "message": "This action is unauthorized."
}
```

### Validation Errors
```typescript
// 422 Unprocessable Entity
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title field is required."],
    "latitude": ["The latitude must be between -90 and 90."],
    "longitude": ["The longitude must be between -180 and 180."],
    "visited_at": ["The visited at does not match the format Y-m-d."]
  }
}
```

### Not Found Errors
```typescript
// 404 Not Found
{
  "message": "No query results for model [App\\Models\\TravelPin]."
}
```

## 💡 Frontend Integration Tips

### 1. Coordinate Handling
```typescript
// Frontend typically uses [longitude, latitude] format (GeoJSON)
// API expects separate latitude and longitude fields

// When sending to API:
const apiData = {
  title: pin.title,
  latitude: coordinates[1],  // lat
  longitude: coordinates[0], // lng
  // ...
};

// When receiving from API:
const coordinates = [data.longitude, data.latitude]; // [lng, lat]
```

### 2. Date Formatting
```typescript
// API expects ISO date format (YYYY-MM-DD)
const visitedAt = new Date().toISOString().split('T')[0]; // "2024-03-15"

// HTML date input format is compatible
<input type="date" value={pin.visited_at} />
```

### 3. Markdown Support
```typescript
// API stores raw markdown - frontend handles rendering
// Use a markdown parser like 'marked' or 'react-markdown'
import { marked } from 'marked';

const htmlContent = marked(pin.note || '');
```

### 4. Authentication Check
```typescript
// Check if user is authenticated before showing create/edit buttons
const isAuthenticated = !!localStorage.getItem('access_token');

// Only authenticated users can create/modify pins
{isAuthenticated && (
  <button onClick={createPin}>Add Pin</button>
)}
```

### 5. Error Handling
```typescript
async function createTravelPin(pinData) {
  try {
    const response = await fetch('/api/v1/travel-pins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify(pinData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 422) {
        // Handle validation errors
        console.error('Validation errors:', errorData.errors);
      } else if (response.status === 401) {
        // Handle authentication errors
        console.error('Authentication required');
      }
      
      throw new Error(errorData.message || 'Failed to create pin');
    }

    const result = await response.json();
    return result.data; // Return the created pin
  } catch (error) {
    console.error('Error creating travel pin:', error);
    throw error;
  }
}
```

### 6. TypeScript Interface
```typescript
interface TravelPinAPI {
  getAllPins(): Promise<TravelPin[]>;
  getPin(id: number): Promise<TravelPin>;
  createPin(data: CreateTravelPinData): Promise<TravelPin>;
  updatePin(id: number, data: Partial<CreateTravelPinData>): Promise<TravelPin>;
  deletePin(id: number): Promise<void>;
}

interface CreateTravelPinData {
  title: string;
  note?: string;
  latitude: number;
  longitude: number;
  visited_at: string; // YYYY-MM-DD format
  photo_url?: string;
}
```

## 🎯 Quick Start Example

```typescript
// Fetch all pins (public)
const pins = await fetch('/api/v1/travel-pins').then(r => r.json());
console.log(pins.data); // Array of travel pins

// Create a new pin (requires authentication)
const newPin = await fetch('/api/v1/travel-pins', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    title: 'My Travel Location',
    latitude: 25.033964,
    longitude: 121.564472,
    visited_at: '2024-03-15'
  })
}).then(r => r.json());

console.log(newPin.data); // Created travel pin object
```

## 🔄 Real-time Updates

Since some operations require authentication and others don't, consider:

1. **Public pin viewing** - Anyone can see all pins
2. **Authenticated operations** - Only logged-in users can create/modify
3. **Ownership validation** - Users can only edit/delete their own pins

The API is designed to support a collaborative travel pins map where everyone can view pins, but modifications require authentication and ownership validation.