# Backend Server

Basic Node.js Express server for the terminal website with ChatGPT integration.

## Installation

```bash
npm install
```

## OpenAI API Setup

The chat feature requires an OpenAI API key. To set it up:

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a `.env` file in the `backend` directory
3. Add your API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

The server will automatically load environment variables from the `.env` file.

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

### POST /api/chat

Chat endpoint with ChatGPT integration.

**Request:**
```json
{
  "userMessage": "Hello, how are you?",
  "sessionId": "session_12345"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "response": "Hello! I'm doing well, thank you for asking. How can I assist you today?"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "response": "Sorry, I encountered an error. Please try again."
}
```

## Port

Default port: `2121` (configurable via PORT environment variable)

## Chat Features

- Dynamic responses using ChatGPT GPT-4o-mini model
- Session-based chat history (context maintained)
- Automatic history management (last 10 messages)
- Terminal-style personality for KUWENI character

