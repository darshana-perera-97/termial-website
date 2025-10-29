const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 2121;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Login validation endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] Login attempt from user: ${username || 'N/A'}`);

  // Validate credentials
  const isValidUsername = username && username.toUpperCase() === 'KUWENI';
  const isValidPassword = password === '1';

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

