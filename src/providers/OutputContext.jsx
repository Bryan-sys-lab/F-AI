import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';

const OutputContext = createContext();
const CONVERSATION_STORAGE_KEY = 'chat_conversation';

export function OutputProvider({ children }) {
  // Load conversation from localStorage on mount
  const loadConversation = () => {
    try {
      const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load conversation from localStorage:', error);
      return [];
    }
  };

  // Save conversation to localStorage
  const saveConversation = (conversation) => {
    try {
      localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversation));
    } catch (error) {
      console.warn('Failed to save conversation to localStorage:', error);
    }
  };

  const [output, setOutput] = useState(loadConversation);
  const outputRef = useRef(null);
  const { on, off } = useWebSocket();

  const addOutput = (entry) => {
    setOutput(prev => {
      const newOutput = [...prev, entry];
      saveConversation(newOutput);
      return newOutput;
    });
  };

  const clearOutput = () => {
    setOutput([]);
    try {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear conversation from localStorage:', error);
    }
  };

  useEffect(() => {
    // WebSocket output handling is now managed by TaskContext
    // to avoid duplication and ensure proper parsing
    return () => {};
  }, []);

  return (
    <OutputContext.Provider value={{ output, addOutput, clearOutput, outputRef }}>
      {children}
    </OutputContext.Provider>
  );
}

export function useOutput() {
  const context = useContext(OutputContext);
  if (!context) {
    throw new Error('useOutput must be used within an OutputProvider');
  }
  return context;
}