# Backend Server

Basic Node.js Express server for the terminal website.

## Installation

```bash
npm install
```

## Running the Server

Start the server:
```bash
npm start
```

Start with auto-reload (development):
```bash
npm run dev
```

## API Endpoints

### GET /

Returns server status:
```json
{
  "message": "Server is running",
  "status": "active",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/login

Validates user credentials.

**Request:**
```json
{
  "username": "KUWENI",
  "password": "1"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": "KUWENI"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid username",
  "field": "username"
}
```

## Port

Default port: `2121` (configurable via PORT environment variable)

