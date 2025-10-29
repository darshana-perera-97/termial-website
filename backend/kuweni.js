require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2121;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Store chat history per session (in production, use a proper database)
const chatHistory = new Map();

// Logging function to write messages to logs.txt
function logMessage(message) {
  const logPath = path.join(__dirname, 'logs.txt');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  fs.appendFile(logPath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

// Chat endpoint with ChatGPT integration
app.post('/api/chat', async (req, res) => {
  const { userMessage, sessionId } = req.body;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] Chat message from VIJAYA: "${userMessage}"`);
  logMessage(`VIJAYA: ${userMessage}`);
  
  try {
    // Get or create session history
    if (!chatHistory.has(sessionId)) {
      chatHistory.set(sessionId, []);
    }
    const history = chatHistory.get(sessionId);
    
    // Add user message to history
    history.push({ role: 'user', content: userMessage });
    
    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are KUWENI, a 28 year old lady who studied in Trincomalee campus in 2019 in CS. This system is developed inside the Java Lab in CS Department. You are now working for a secret Organization in Sri Lanka. If the user wants more details, tell them to search the bedroom (they can use 'show_map' command). DO NOT provide any location details. Give small, short, straight answers.`
      },
      ...history
    ];
    
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 50
    });
    
    const assistantMessage = completion.choices[0].message.content;
    
    // Log KUWENI's response
    logMessage(`KUWENI: ${assistantMessage}`);
    
    // Add assistant response to history
    history.push({ role: 'assistant', content: assistantMessage });
    
    // Keep only last 10 messages to manage context
    if (history.length > 10) {
      history.shift();
    }
    
    res.json({
      success: true,
      response: assistantMessage
    });
  } catch (error) {
    console.error('ChatGPT error:', error);
    logMessage(`ERROR: ${error.message}`);
    res.status(500).json({
      success: false,
      response: 'Error occurred.'
    });
  }
});

// Login validation endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] Login attempt from user: ${username || 'N/A'}`);

  // Validate credentials
  const isValidUsername = username && username.toUpperCase() === 'KUWENI';
  const isValidPassword = password === 'WEAREONE';

  if (!username) {
    console.log(`[${timestamp}] Login failed: Username required`);
    return res.status(400).json({
      success: false,
      message: 'Username is required',
      field: 'username'
    });
  }

  if (!password) {
    console.log(`[${timestamp}] Login failed: Password required`);
    return res.status(400).json({
      success: false,
      message: 'Password is required',
      field: 'password'
    });
  }

  if (isValidUsername && isValidPassword) {
    console.log(`[${timestamp}] ✓ Authentication SUCCESSFUL for user: ${username.toUpperCase()}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log(`ACCESS GRANTED - User: ${username.toUpperCase()}`);
    console.log(`IP Address: ${req.ip}`);
    console.log(`Session: ${timestamp}`);
    console.log('═══════════════════════════════════════════════════════');
    
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: username.toUpperCase()
    });
  }

  if (!isValidUsername) {
    console.log(`[${timestamp}] ✗ Login FAILED: Invalid username '${username}'`);
    return res.status(401).json({
      success: false,
      message: 'Invalid username',
      field: 'username'
    });
  }

  if (!isValidPassword) {
    console.log(`[${timestamp}] ✗ Login FAILED: Invalid password for user '${username}'`);
    return res.status(401).json({
      success: false,
      message: 'Invalid password',
      field: 'password'
    });
  }
});

// Serve static files from React build folder (must come after API routes)
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(buildPath)) {
  // Serve static files
  app.use(express.static(buildPath));
  
  // Catch-all handler: send back React's index.html file for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // If build folder doesn't exist, show a message at root
  app.get('/', (req, res) => {
    res.json({
      message: 'Server is running',
      status: 'active',
      note: 'React build folder not found. Please run "npm run build" in the frontend directory.',
      timestamp: new Date().toISOString()
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log('\n====================================================');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         TERMINAL WEBSITE BACKEND SERVER          ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('====================================================');
  console.log(`\n✓ Server is running on port ${PORT}`);
  console.log(`✓ Ready to accept connections`);
  console.log(`✓ Listening for login attempts...\n`);
  console.log('====================================================\n');
});

