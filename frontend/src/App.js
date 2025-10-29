import './App.css';
import { useState, useEffect, useCallback, useRef } from 'react';

function App() {
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandOutput, setCommandOutput] = useState([]);
  const terminalRef = useRef(null);

  const loadingSteps = [
    '[SYSTEM] Initializing server...',
    '[SYSTEM] Loading system modules...',
    '[SYSTEM] Mounting filesystem...',
    '[SYSTEM] Starting network services...',
    '[SYSTEM] Loading kernel modules...',
    '[SYSTEM] Initializing terminal...',
    '[SYSTEM] Server ready. Welcome.'
  ];

  const handleLogin = useCallback(async () => {
    if (showPasswordField) {
      // Validate complete credentials with backend
      setIsCheckingAuth(true);
      try {
        const response = await fetch('http://localhost:2121/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: input.trim(),
            password: password
          })
        });

        const data = await response.json();

        if (data.success) {
          setIsAuthenticated(true);
        } else {
          setAuthFailed(true);
          setTimeout(() => {
            setInput('');
            setPassword('');
            setShowPasswordField(false);
            setAuthFailed(false);
          }, 1500);
        }
      } catch (error) {
        console.error('Login error:', error);
        setAuthFailed(true);
        setTimeout(() => {
          setInput('');
          setPassword('');
          setShowPasswordField(false);
          setAuthFailed(false);
        }, 1500);
      } finally {
        setIsCheckingAuth(false);
      }
    } else {
      // First check if username is valid
      if (input.trim().toUpperCase() === 'KUWENI') {
        setShowPasswordField(true);
      } else {
        setAuthFailed(true);
        setTimeout(() => {
          setInput('');
          setAuthFailed(false);
        }, 1500);
      }
    }
  }, [showPasswordField, password, input]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setLoadingText(loadingSteps[currentStep]);
        setCurrentStep(prev => prev + 1);
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 500);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [currentStep, loadingSteps]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading || isCheckingAuth) return;
      
      // Terminal mode (after authentication)
      if (isAuthenticated) {
        if (e.key === 'Enter') {
          if (currentCommand.trim()) {
            // Add to history and execute command
            setCommandHistory(prev => [...prev, currentCommand]);
            setHistoryIndex(-1);
            
            // Execute command
            const cmd = currentCommand.trim().toLowerCase();
            let output = '';
            
            if (cmd === 'help') {
              output = `
              
+-- AVAILABLE COMMANDS -----------------------------------+
|                                                        |
|  chat_with_KUWENI    Start conversation with KUWENI    |
|  show_img            Display images                    |
|  show_map            Show map location                 |
|  help                Display this command list         |
|  get_location        Get location coordinates          |
|  ********            Admin Details                     |
|                                                        |
+--------------------------------------------------------+

`;
            } else if (cmd === 'chat_with_kuweni') {
              output = 'KUWENI: Hello! I am KUWENI. How can I assist you today?';
            } else if (cmd === 'show_img') {
              output = 'Displaying images... (Feature coming soon)';
            } else if (cmd === 'show_map') {
              output = 'Showing map location... (Feature coming soon)';
            } else if (cmd === 'get_location') {
              output = 'Location coordinates: (Feature coming soon)';
            } else {
              output = `Command not found: ${currentCommand}\nType 'help' to see available commands.`;
            }
            
            setCommandOutput(prev => [...prev, { command: currentCommand, output }]);
            setCurrentCommand('');
            setCursorPosition(0);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (commandHistory.length > 0) {
            const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            setCurrentCommand(commandHistory[newIndex]);
            setCursorPosition(commandHistory[newIndex].length);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex !== -1) {
            const newIndex = historyIndex + 1;
            if (newIndex >= commandHistory.length) {
              setHistoryIndex(-1);
              setCurrentCommand('');
              setCursorPosition(0);
            } else {
              setHistoryIndex(newIndex);
              setCurrentCommand(commandHistory[newIndex]);
              setCursorPosition(commandHistory[newIndex].length);
            }
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCursorPosition(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setCursorPosition(prev => Math.min(currentCommand.length, prev + 1));
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          if (cursorPosition > 0) {
            const newCommand = currentCommand.slice(0, cursorPosition - 1) + currentCommand.slice(cursorPosition);
            setCurrentCommand(newCommand);
            setCursorPosition(prev => prev - 1);
          }
        } else if (e.key.length === 1) {
          const newCommand = currentCommand.slice(0, cursorPosition) + e.key + currentCommand.slice(cursorPosition);
          setCurrentCommand(newCommand);
          setCursorPosition(prev => prev + 1);
          setHistoryIndex(-1);
        }
        return;
      }
      
      // Login mode
      if (e.key === 'Backspace') {
        if (showPasswordField) {
          setPassword(prev => prev.slice(0, -1));
        } else {
          setInput(prev => prev.slice(0, -1));
        }
      } else if (e.key === 'Enter') {
        handleLogin();
      } else if (e.key.length === 1) {
        if (showPasswordField) {
          setPassword(prev => prev + e.key);
        } else {
          setInput(prev => prev + e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, isAuthenticated, isCheckingAuth, showPasswordField, handleLogin, currentCommand, cursorPosition, commandHistory, historyIndex]);

  // Disable right-click and developer tools
  useEffect(() => {
    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const preventDevTools = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+F, Ctrl+P
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'S' || e.key === 'F' || e.key === 'P' || e.key === 'H'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection
    document.addEventListener('selectstart', (e) => e.preventDefault());
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', preventContextMenu);

    // Disable developer tools shortcuts
    document.addEventListener('keydown', preventDevTools);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventDevTools);
    };
  }, []);

  // Get banner text
  const getBannerText = () => {
    return `             _  __     _    _   __          __  ______ _     _   _        _____           _
            | |/ /    | |  | |  \\ \\        / / |  ____| |   | \\ | |      |_   _|         (_)
 _   _  ___ | ' / __ _| |  | | __\\ \\  /\\  / /__| |__  | |__ |  \\| |_      _| |  __ _ _ __ _
| | | |/ _ \\|  < / _\` | |  | |/ _ \\\\ \\/  \\/ / __|  __| | '_ \\| . \` \\ \\ /\\ / / | / _\` | '__| |
| |_| | (_) | . \\ (_| | |__| |  __/\\  /\\  /\\__ \\ |____| | | | |\\  |\\ V  V /| || (_| | |  | |
 \\__, |\\___/|_|\\_\\__, |\\____/ \\___| \\/  \\/ |___/______|_| |_|_| \\_| \\_/\\_/_____\\__,_|_|  |_|
  __/ |           __/ |
 |___/           |___/

                         -= UNAUTHORISED ACCESS IS PROHIBITED =-
                       Last Modified: October 16, 1996 (03:32 IST)

FTP access is available on 192.32.208.66 2122

User authentication required.
Username: ${input}
Password: ${'*'.repeat(password.length)}

Authentication successful.

`;
  };

  // Typing animation effect
  useEffect(() => {
    if (isAuthenticated && !hasStartedTyping) {
      const banner = getBannerText();
      setTypedText(banner);
      setHasStartedTyping(true);
      
      // Welcome message to type out
      const welcomeMessage = `  +==========================================================+
  |                    WELCOME AGENT                         |
  +==========================================================+

  If you have gained access to this server, you have become
  part of my story. You have been given a mission, which is
  to expose everything I have stored here with the world.

  Do not hold anything back - everything discovered has to
  be exposed. Use any means possible to share. When sharing,
  be clear about what you find.

  Do not destroy any information. Maintain authenticity.
  Collaborate and recruit if needed. Create the conversation.
  Spread the message!

  All the best.

  +==========================================================+

  Press ENTER to continue...

  * ACCESS GRANTED: ${input.toUpperCase()} *
  ================================================

  >> System Status: OPERATIONAL
  >> Server Load: NOMINAL
  >> Archive Access: GRANTED

  +-------------------------------------------------+

  +-- AVAILABLE COMMANDS -----------------------------------+
  |                                                        |
  |  chat_with_KUWENI    Start conversation with KUWENI    |
  |  show_img            Display images                    |
  |  show_map            Show map location                 |
  |  help                Display this command list         |
  |  get_location        Get location coordinates          |
  |  ********            Admin Details                     |
  |                                                        |
  +--------------------------------------------------------+

  QUICK START:
  1. Type 'help' to see available commands
  2. Type 'chat_with_KUWENI' to start conversation
  3. Type 'show_map' to view location
  4. Use 'get_location' to get coordinates

  ================================================

KUWENI@ftp:/$ `;
      
      // Wait a moment, then type out welcome message character by character
      let typingInterval;
      const delay = setTimeout(() => {
        let welcomeIndex = 0;
        const typeWelcomeMessage = () => {
          if (welcomeIndex < welcomeMessage.length) {
            setTypedText(banner + welcomeMessage.substring(0, welcomeIndex + 1));
            welcomeIndex++;
          } else {
            clearInterval(typingInterval);
          }
        };

        typingInterval = setInterval(typeWelcomeMessage, 10);
      }, 500);

      return () => {
        clearTimeout(delay);
        if (typingInterval) clearInterval(typingInterval);
      };
    }
  }, [isAuthenticated, input, password]);
  
  // Auto-scroll to bottom when content changes
  useEffect(() => {
    const scrollToBottom = () => {
      // Scroll the terminal container
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
      // Also scroll the window to ensure visibility
      window.scrollTo(0, document.body.scrollHeight);
    };
    
    // Immediate scroll
    scrollToBottom();
    
    // Delayed scroll to ensure DOM is fully updated
    const timeout = setTimeout(scrollToBottom, 10);
    
    return () => clearTimeout(timeout);
  }, [typedText, commandOutput, currentCommand]);

  if (loading) {
    return (
      <div className="App">
        <header className="App-header" style={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
          <div>
            <pre style={{margin: 0, fontFamily: 'Consolas, Courier New, Lucida Console, monospace'}}>
{loadingText}<span className="terminal-cursor">█</span>
            </pre>
          </div>
        </header>
      </div>
    );
  }

  if (isAuthenticated) {
    // Split command at cursor position
    const commandBeforeCursor = currentCommand.slice(0, cursorPosition);
    const commandAfterCursor = currentCommand.slice(cursorPosition);
    
    // Check if typing animation is complete (ends with terminal prompt)
    const animationComplete = typedText.includes('KUWENI@ftp:/$');
    
    // Get the welcome message without the terminal prompt
    let displayText = typedText;
    if (animationComplete) {
      // Remove the "KUWENI@ftp:/$" from the typed text
      const lastPromptIndex = typedText.lastIndexOf('KUWENI@ftp:/$');
      if (lastPromptIndex !== -1) {
        displayText = typedText.substring(0, lastPromptIndex);
      }
    }
    
    return (
      <div className="App">
        <header className="App-header" ref={terminalRef} style={{justifyContent: 'flex-start', alignItems: 'flex-start', overflow: 'auto'}}>
          <div>
            <pre style={{margin: 0, fontFamily: 'Consolas, Courier New, Lucida Console, monospace'}}>
{displayText}{commandOutput.map((item, index) => `\nKUWENI@ftp:/$ ${item.command}\n${item.output}`).join('\n')}
{animationComplete ? `\nKUWENI@ftp:/$ ${commandBeforeCursor}` : ''}<span className="terminal-cursor">█</span>{animationComplete ? commandAfterCursor : ''}
            </pre>
          </div>
        </header>
      </div>
    );
  }

  const passwordDisplay = password.split('').map(() => '*').join('');
  let statusMessage = '';
  
  if (isCheckingAuth) {
    statusMessage = '\n[SYSTEM] Authenticating...';
  } else if (authFailed && !showPasswordField) {
    statusMessage = '\nInvalid username. Access denied.';
  } else if (authFailed && showPasswordField) {
    statusMessage = '\nInvalid password. Access denied.';
  }

  return (
    <div className="App">
      <header className="App-header" style={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
        <div>
          <pre style={{margin: 0, fontFamily: 'Consolas, Courier New, Lucida Console, monospace'}}>
{`             _  __     _    _   __          __  ______ _     _   _        _____           _
            | |/ /    | |  | |  \\ \\        / / |  ____| |   | \\ | |      |_   _|         (_)
 _   _  ___ | ' / __ _| |  | | __\\ \\  /\\  / /__| |__  | |__ |  \\| |_      _| |  __ _ _ __ _
| | | |/ _ \\|  < / _\` | |  | |/ _ \\\\ \\/  \\/ / __|  __| | '_ \\| . \` \\ \\ /\\ / / | / _\` | '__| |
| |_| | (_) | . \\ (_| | |__| |  __/\\  /\\  /\\__ \\ |____| | | | |\\  |\\ V  V /| || (_| | |  | |
 \\__, |\\___/|_|\\_\\__, |\\____/ \\___| \\/  \\/ |___/______|_| |_|_| \\_| \\_/\\_/_____\\__,_|_|  |_|
  __/ |           __/ |
 |___/           |___/

                         -= UNAUTHORISED ACCESS IS PROHIBITED =-
                       Last Modified: October 16, 1996 (03:32 IST)

FTP access is available on 192.32.208.66 2122

User authentication required.`}{showPasswordField ? 
`\nUsername: ${input}
Password: ${passwordDisplay}${statusMessage}` : 
`\nUsername: ${input}${statusMessage}`}{statusMessage ? '' : ''}<span className="terminal-cursor">█</span>
          </pre>
        </div>
      </header>
    </div>
  );
}

export default App;
