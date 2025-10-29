import './App.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { asciiImages } from './asciiImages';
import { API_ENDPOINTS } from './config';

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
  const [imageSelectionMode, setImageSelectionMode] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [chatMode, setChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [botReplyCount, setBotReplyCount] = useState(0);
  const [typingMessage, setTypingMessage] = useState({ index: null, text: '', fullText: '' });
  const [currentLocation, setCurrentLocation] = useState(null);
  const typingIntervalRef = useRef(null);
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

  // ASCII Art for selected image
  const getAsciiImage = () => {
    if (selectedImageIndex === null) return '';
    // Return a sample of the ASCII art you provided
    return asciiImages[selectedImageIndex] || 'No image available.';
  };

  // Function to wrap text content in a box
  const wrapInBox = (title, text) => {
    const boxWidth = 76; // Fixed width for better display
    const contentLines = text.trim().split('\n');
    
    let result = `\n╔${'═'.repeat(boxWidth)}╗\n`;
    // Center the title
    const titlePadding = Math.floor((boxWidth - title.length) / 2);
    result += `║${' '.repeat(titlePadding)}${title}${' '.repeat(boxWidth - title.length - titlePadding)}║\n`;
    result += `╠${'═'.repeat(boxWidth)}╣\n`;
    
    contentLines.forEach(line => {
      if (line.trim() === '') {
        result += `║${' '.repeat(boxWidth)}║\n`;
      } else {
        // Handle long lines by word-wrapping
        let remaining = line;
        while (remaining.length > 0) {
          if (remaining.length <= boxWidth - 4) {
            result += `║ ${remaining.padEnd(boxWidth - 4)} ║\n`;
            remaining = '';
          } else {
            // Try to break at a word boundary
            let breakPoint = boxWidth - 4;
            for (let i = breakPoint; i > 0; i--) {
              if (remaining[i] === ' ') {
                breakPoint = i;
                break;
              }
            }
            result += `║ ${remaining.substring(0, breakPoint).padEnd(boxWidth - 4)} ║\n`;
            remaining = remaining.substring(breakPoint).trim();
          }
        }
      }
    });
    
    result += `╚${'═'.repeat(boxWidth)}╝\n`;
    return result;
  };

  // Item content data
  const itemContent = {
    DOOR: {
      0: {
        name: 'PICTURE',
        type: 'ascii',
        content: `
    ╔════════════════════╗
    ║                    ║
    ║     /\\_/\\         ║
    ║    ( o.o )         ║
    ║     > ^ <          ║
    ║                    ║
    ║    PICTURE FRAME    ║
    ╚════════════════════╝
`
      },
      1: {
        name: 'CALENDER',
        type: 'calendar',
        content: `
    October 2025
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│     │     │  1  │  2  │  3  │  4  │  5  │
│  6  │  7  │  8  │  9  │ 10  │ 11  │ 12  │
│ 13  │ 14  │ 15  │ 16  │ 17  │ 18  │ 19  │
│ 20  │ 21  │ 22  │ 23  │ 24  │ 25  │ 26  │
│ 27  │ 28  │ 29  │ 30  │ 31  │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘
`
      }
    },
    DESK: {
      0: {
        name: 'LAPTOP',
        type: 'ascii',
        content: `
╔════════════════════════════════╗
║                                ║
║     ⚠️  ERROR  ⚠️              ║
║                                ║
║  ████████ NO POWER ████████    ║
║                                ║
║  [SYSTEM] Laptop is not       ║
║           connected to power   ║
║                                ║
╚════════════════════════════════╝
`
      },
      1: {
        name: 'PAPER',
        type: 'ascii',
        content: `
    IoT Project Sketch - NodeMCU
    
    ┌─────────────┐
    │   NodeMCU   │
    │  (ESP8266)  │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Sensor    │
    │   (DHT22)   │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Cloud     │
    │   Server    │
    └─────────────┘
    
    Project: Temperature & Humidity Monitor
`
      },
      2: {
        name: 'NOTEBOOK',
        type: 'text',
        content: `
AI Technology Blog

Artificial Intelligence has revolutionized the way we interact with technology, transforming industries from healthcare to finance, and reshaping our daily lives in unprecedented ways. Machine learning algorithms now power recommendation systems, enabling platforms to understand user preferences and deliver personalized experiences. Deep learning, a subset of machine learning, has achieved remarkable breakthroughs in image recognition, natural language processing, and autonomous systems.

The rise of generative AI models has opened new frontiers in creativity and problem-solving. Large language models can now generate human-like text, assist in coding, and provide intelligent responses across various domains. These technologies are not just tools but collaborative partners that enhance human capabilities rather than replace them.

However, the rapid advancement of AI also brings challenges. Ethical considerations around privacy, bias, and job displacement require careful navigation. As we integrate AI more deeply into society, we must ensure these systems are transparent, fair, and beneficial for all. The future of AI lies in responsible development, where technology serves humanity's best interests while addressing complex global challenges.
`
      }
    },
    BED: {
      0: {
        name: 'STORY BOOK',
        type: 'text',
        content: `
Harry Potter Story Excerpt

Harry stood alone in the dimly lit corridor of Hogwarts, his wand held tightly in his trembling hand. The ancient stones whispered secrets of generations past, and the candlelight danced shadows upon the walls like phantoms. He could hear the distant echo of footsteps approaching, each step resonating with purpose and mystery.

The air grew colder as a figure emerged from the darkness. It was Professor Snape, his dark robes billowing like a specter of night itself. His piercing eyes met Harry's with a mixture of disapproval and something else—something that might have been respect, or perhaps even concern. The silence between them was heavy, filled with unspoken words and hidden truths.

"You seek answers," Snape's voice cut through the stillness like a knife. "But are you prepared for what you might discover?" Harry felt the weight of those words, understanding that knowledge came with responsibility, and truth often carried a price. In that moment, he realized that his journey was not just about defeating darkness, but about understanding the complexities of good and evil, love and loss, and the sacrifices required for true courage.

The castle seemed to hold its breath, waiting for his response. Outside, the stars shone bright above the Forbidden Forest, witnesses to the timeless struggle between light and shadow that defined both the wizarding world and Harry's own destiny.
`
      },
      1: {
        name: 'PILLOW',
        type: 'text',
        content: '\nNothing found.\n'
      },
      2: {
        name: 'BED SHEET',
        type: 'text',
        content: '\nNothing found.\n'
      }
    },
    BOOKS: {
      0: { name: 'BOOK_01', content: 'Book content not available yet.' },
      1: { name: 'BOOK_02', content: 'Book content not available yet.' },
      2: { name: 'BOOK_03', content: 'Book content not available yet.' },
      3: { name: 'BOOK_04', content: 'Book content not available yet.' },
      4: { name: 'BOOK_05', content: 'Book content not available yet.' },
      5: { name: 'BOOK_06', content: 'Book content not available yet.' },
      6: { name: 'BOOK_07', content: 'Book content not available yet.' },
      7: { name: 'BOOK_08', content: 'Book content not available yet.' },
      8: { name: 'BOOK_09', content: 'Book content not available yet.' },
      9: { name: 'BOOK_10', content: 'Book content not available yet.' }
    }
  };

  // Start typing animation for KUWENI messages
  const startTypingAnimation = (fullText, messageIndex) => {
    // Clear any existing typing animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    setTypingMessage({ index: messageIndex, text: '', fullText });
    
    let currentIndex = 0;
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypingMessage(prev => ({
          ...prev,
          text: fullText.substring(0, currentIndex + 1)
        }));
        currentIndex++;
      } else {
        // Animation complete
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setTypingMessage({ index: null, text: '', fullText: '' });
        // Update chat history with full message
        setChatHistory(prev => {
          const newHistory = [...prev];
          if (newHistory[messageIndex]) {
            newHistory[messageIndex] = { sender: 'KUWENI', message: fullText };
          }
          return newHistory;
        });
      }
    }, 15); // 15ms per character for typing speed
  };

  const handleLogin = useCallback(async () => {
    if (showPasswordField) {
      // Validate complete credentials with backend
      setIsCheckingAuth(true);
      try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
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
        // Handle Ctrl+C to exit chat mode
        if (e.ctrlKey && e.key === 'c' && chatMode) {
          e.preventDefault();
          setChatMode(false);
          setChatHistory([]); // Clear chat messages
          setCurrentCommand('');
          setCursorPosition(0);
          // Clean up typing animation if active
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setTypingMessage({ index: null, text: '', fullText: '' });
          const output = '\n[SYSTEM] Chat session ended. Use "chat_with_KUWENI" to restart.';
          setCommandOutput(prev => [...prev, { command: 'chat', output }]);
          return;
        }
        
        // Chat mode handling
        if (chatMode && e.key === 'Enter') {
          if (currentCommand.trim()) {
            // Check if we've reached the 8 message limit
            if (botReplyCount >= 8) {
              // Add KUWENI ending message with typing animation
              const endingMessage = 'I have to end our conversation now. Chat session ended.';
              setChatHistory(prev => {
                const newHistory = [...prev];
                const messageIndex = newHistory.length;
                newHistory.push({ sender: 'KUWENI', message: '' }); // Placeholder
                startTypingAnimation(endingMessage, messageIndex);
                return newHistory;
              });
              setTimeout(() => {
                setChatMode(false);
                setChatHistory([]); // Clear chat messages
                // Clean up typing animation
                if (typingIntervalRef.current) {
                  clearInterval(typingIntervalRef.current);
                  typingIntervalRef.current = null;
                }
                setTypingMessage({ index: null, text: '', fullText: '' });
                // Add system message to command output
                const output = '\n[SYSTEM] Chat session ended. Use "chat_with_KUWENI" to restart.';
                setCommandOutput(prev => [...prev, { command: 'chat', output }]);
              }, endingMessage.length * 15 + 50);
              setCurrentCommand('');
              setCursorPosition(0);
              return;
            }
            
            const userMessage = currentCommand.trim();
            
            // Add user message immediately to chat history
            setChatHistory(prev => [...prev, { sender: 'VIJAYA', message: userMessage }]);
            
            // Clear input
            setCurrentCommand('');
            setCursorPosition(0);
            
            // Add command to history
            setCommandHistory(prev => [...prev, userMessage]);
            setHistoryIndex(-1);
            
            // Send to backend
            fetch(API_ENDPOINTS.CHAT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userMessage, sessionId: chatSessionId })
            })
            .then(res => res.json())
            .then(data => {
              // Check if we've reached the 8 message limit
              const newCount = botReplyCount + 1;
              setBotReplyCount(newCount);
              
              // Add placeholder for KUWENI response and start typing animation
              if (data.success) {
                setChatHistory(prev => {
                  const newHistory = [...prev];
                  const messageIndex = newHistory.length;
                  newHistory.push({ sender: 'KUWENI', message: '' }); // Placeholder
                  startTypingAnimation(data.response, messageIndex);
                  return newHistory;
                });
              } else {
                setChatHistory(prev => {
                  const newHistory = [...prev];
                  const messageIndex = newHistory.length;
                  newHistory.push({ sender: 'KUWENI', message: '' }); // Placeholder
                  startTypingAnimation(data.response || 'Error occurred.', messageIndex);
                  return newHistory;
                });
              }
              
              // Exit chat mode after 8 bot replies
              if (newCount >= 8) {
                setTimeout(() => {
                  // Add KUWENI ending message with typing animation
                  const endingMessage = 'I have to end our conversation now. Chat session ended.';
                  setChatHistory(prev => {
                    const newHistory = [...prev];
                    const messageIndex = newHistory.length;
                    newHistory.push({ sender: 'KUWENI', message: '' }); // Placeholder
                    startTypingAnimation(endingMessage, messageIndex);
                    return newHistory;
                  });
                  // Exit chat mode after ending message animation completes
                  setTimeout(() => {
                    setChatMode(false);
                    setChatHistory([]); // Clear chat messages
                    // Clean up typing animation
                    if (typingIntervalRef.current) {
                      clearInterval(typingIntervalRef.current);
                      typingIntervalRef.current = null;
                    }
                    setTypingMessage({ index: null, text: '', fullText: '' });
                    // Add system message to command output
                    const output = '\n[SYSTEM] Chat session ended. Use "chat_with_KUWENI" to restart.';
                    setCommandOutput(prev => [...prev, { command: 'chat', output }]);
                  }, endingMessage.length * 15 + 500);
                }, 500);
              }
            })
            .catch(error => {
              console.error('Chat error:', error);
              setChatHistory(prev => {
                const newHistory = [...prev];
                const messageIndex = newHistory.length;
                newHistory.push({ sender: 'KUWENI', message: '' }); // Placeholder
                startTypingAnimation('Error: Could not connect to server.', messageIndex);
                return newHistory;
              });
            });
          }
          return;
        }
        
        if (e.key === 'Enter') {
          if (currentCommand.trim()) {
            // Add to history and execute command
            setCommandHistory(prev => [...prev, currentCommand]);
            setHistoryIndex(-1);
            
            // Handle image selection mode
            if (imageSelectionMode) {
              const index = parseInt(currentCommand.trim());
              if (!isNaN(index) && index >= 0 && index <= 4) {
                setSelectedImageIndex(index);
                setImageSelectionMode(false);
                // Add the image to command output instead of a separate display
                const output = 'Image displayed below';
                setCommandOutput(prev => [...prev, { command: currentCommand, output }]);
              } else {
                const output = 'Invalid index. Please enter a number between 0 and 4.';
                setCommandOutput(prev => [...prev, { command: currentCommand, output }]);
              }
              setCurrentCommand('');
              setCursorPosition(0);
              return;
            }
            
            // Execute command
            const cmd = currentCommand.trim().toLowerCase();
            let output = '';
            
            // Handle location-based commands if in a location
            if (currentLocation) {
              // Handle ".." to go back to root
              if (cmd === '..') {
                setCurrentLocation(null);
                output = '\n[SYSTEM] Returned to root directory.';
                setCommandOutput(prev => [...prev, { command: currentCommand, output }]);
                setCurrentCommand('');
                setCursorPosition(0);
                return;
              }
              
              // Handle "show <index>" command
              if (cmd.startsWith('show ')) {
                const parts = cmd.split(' ');
                if (parts.length === 2) {
                  const index = parseInt(parts[1]);
                  if (!isNaN(index)) {
                    const locationData = itemContent[currentLocation];
                    if (locationData && locationData[index]) {
                      const item = locationData[index];
                      if (item.type === 'text' && (item.name === 'NOTEBOOK' || item.name === 'STORY BOOK')) {
                        // Wrap blog and story in a box
                        output = wrapInBox(item.name, item.content);
                      } else {
                        output = `\n${item.name}\n${item.content}`;
                      }
                    } else {
                      output = `\n[ERROR] Item [${index}] not found in ${currentLocation}.`;
                    }
                  } else {
                    output = `\n[ERROR] Invalid index. Please enter a number.`;
                  }
                } else {
                  output = `\n[ERROR] Usage: show <index>\nExample: show 0`;
                }
                setCommandOutput(prev => [...prev, { command: currentCommand, output }]);
                setCurrentCommand('');
                setCursorPosition(0);
                return;
              }
            }
            
            // Handle "use <location>" command
            if (cmd.startsWith('use ')) {
              const parts = cmd.split(' ');
              if (parts.length === 2) {
                const location = parts[1].toUpperCase();
                const validLocations = ['DOOR', 'DESK', 'PC', 'BED', 'BOOKS'];
                if (validLocations.includes(location)) {
                  setCurrentLocation(location);
                  output = `\n[SYSTEM] Entered ${location} directory.\nUse 'show <index>' to view items.\nUse '..' to go back.`;
                } else {
                  output = `\n[ERROR] Invalid location: ${location}\nValid locations: ${validLocations.join(', ')}`;
                }
              } else {
                output = `\n[ERROR] Usage: use <location>\nExample: use DOOR`;
              }
              setCommandOutput(prev => [...prev, { command: currentCommand, output }]);
              setCurrentCommand('');
              setCursorPosition(0);
              return;
            }
            
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
            } else if (cmd === 'chat_with_kuweni' || cmd === 'chat') {
              // Enter chat mode
              setChatMode(true);
              setChatHistory([]);
              setBotReplyCount(0);
              output = `\nChat mode activated. You are now chatting with KUWENI.\nType your message and press ENTER.\nPress Ctrl+C to exit chat mode.\n`;
            } else if (cmd === 'show_img') {
              output = `Available Images:
[0] location_image.png
[1] places_image.png
[2] kuweni_image.png
[3] path_image.png
[4] route_image.png

Enter image index (0-4):`;
              setImageSelectionMode(true);
            } else if (cmd.startsWith('show_map')) {
              const parts = cmd.split(' ');
              if (parts.length === 1) {
                // Just "show_map" - show the map and instructions
                output = `

============================================
              ROOM LAYOUT
============================================

                [DOOR]
                   |
+--------------        ------------------+
|                             [DESK]     |
|  [CUPBOARD]             ╔══════════╗   |
|  ╔═════════╗            ║    PC    ║   |
|  ║         ║            ║  TABLE   ║   |
|  ║CLOTHES  ║            ╚══════════╝   |
|  ║  BOOKS  ║               ╔═══╗       |
|  ╚═════════╝               ╚═══╝       |
|                                        |
|  ╔══════════════════════════════════╗  |
|  ║                                  ║  |
|  ║                                  ║  |
|  ║                                  ║  |
|  ║                                  ║  |
|  ║             [BED]                ║  |
|  ║                                  ║  |
|  ║                                  ║  |
|  ╚══════════════════════════════════╝  |
+----------------------------------------+

+-- INSTRUCTIONS ----------------------------------+
|                                                  |
|  To see what are inside, use:                    |
|                                                  |
|    show_map DOOR                                 |
|    show_map DESK                                 |
|    show_map PC                                   |
|    show_map BED                                  |
|    show_map BOOKS                                |
|                                                  |
+--------------------------------------------------+
`;
              } else {
                // Has parameter - handle sub-commands
                const location = parts[1].toUpperCase();
                if (location === 'DOOR') {
                  output = `
Items found in DOOR:

[0] PICTURE
[1] CALENDER
`;
                } else if (location === 'DESK') {
                  output = `
Items found in DESK:

[0] LAPTOP
[1] PAPER
[2] NOTEBOOK
`;
                } else if (location === 'PC') {
                  output = `
PC Login Terminal

[SYSTEM] PC access requires authentication.
[SYSTEM] Login feature will be available soon.

(Login functionality will be implemented later)
`;
                } else if (location === 'BED') {
                  output = `
Items found in BED:

[0] STORY BOOK
[1] PILLOW
[2] BED SHEET
`;
                } else if (location === 'BOOKS') {
                  output = `
Books found in BOOKS:

[0] BOOK_01
[1] BOOK_02
[2] BOOK_03
[3] BOOK_04
[4] BOOK_05
[5] BOOK_06
[6] BOOK_07
[7] BOOK_08
[8] BOOK_09
[9] BOOK_10
`;
                } else {
                  output = `\nInvalid location: ${location}\nValid locations: DOOR, DESK, PC, BED, BOOKS`;
                }
              }
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
  }, [loading, isAuthenticated, isCheckingAuth, showPasswordField, handleLogin, currentCommand, cursorPosition, commandHistory, historyIndex, chatMode, imageSelectionMode, chatSessionId, botReplyCount, currentLocation]);

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

Thambapanni access is available on 69.197.187.24 2121

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

KUWENI@thambapanni:/$ `;
      
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
      }, 5);

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
  }, [typedText, commandOutput, currentCommand, chatHistory, typingMessage]);

  // Cleanup typing animation when component unmounts or chat mode exits
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Cleanup typing animation when exiting chat mode
  useEffect(() => {
    if (!chatMode && typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
      setTypingMessage({ index: null, text: '', fullText: '' });
    }
  }, [chatMode]);

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
    const animationComplete = typedText.includes('KUWENI@thambapanni:/$');
    
    // Get the welcome message without the terminal prompt
    let displayText = typedText;
    if (animationComplete) {
      // Remove the "KUWENI@thambapanni:/$" from the typed text
      const lastPromptIndex = typedText.lastIndexOf('KUWENI@thambapanni:/$');
      if (lastPromptIndex !== -1) {
        displayText = typedText.substring(0, lastPromptIndex);
      }
    }
    
    // Format chat history with typing animation
    const chatDisplay = chatHistory.length > 0 ? chatHistory.map((item, index) => {
      // Show typing animation if this message is currently being typed
      if (item.sender === 'KUWENI' && typingMessage.index === index && typingMessage.text !== '') {
        return `KUWENI> ${typingMessage.text}`;
      }
      // Show empty placeholder if it's a KUWENI message but not yet typed
      if (item.sender === 'KUWENI' && typingMessage.index === index && typingMessage.text === '') {
        return `KUWENI> `;
      }
      // Show normal message
      return `${item.sender}> ${item.message}`;
    }).join('\n') : '';
    
    return (
      <div className="App">
        <header className="App-header" ref={terminalRef} style={{justifyContent: 'flex-start', alignItems: 'flex-start', overflow: 'auto'}}>
          <div>
            <pre style={{margin: 0, fontFamily: 'Consolas, Courier New, Lucida Console, monospace'}}>
{displayText}{commandOutput.map((item, index) => {
  let output = item.output;
  // If this command was an image selection (0-4), show the ASCII art
  const cmdIndex = parseInt(item.command.trim());
  if (!isNaN(cmdIndex) && cmdIndex >= 0 && cmdIndex <= 4 && item.output === 'Image displayed below') {
    output += '\n' + (asciiImages[cmdIndex] || '');
  }
  return `\nKUWENI@thambapanni:/$ ${item.command}\n${output}`;
}).join('\n')}
{chatDisplay}
{animationComplete ? (chatMode ? `\nVIJAYA> ${commandBeforeCursor}` : `\nKUWENI@thambapanni:/${currentLocation ? `$${currentLocation}/` : '$'} ${commandBeforeCursor}`) : ''}<span className="terminal-cursor">█</span>{animationComplete ? commandAfterCursor : ''}
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

thambapanni access is available on 69.197.187.24 2122

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
