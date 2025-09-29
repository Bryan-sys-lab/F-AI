import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';

const OutputContext = createContext();

export function OutputProvider({ children }) {
  const [output, setOutput] = useState([]);
  const outputRef = useRef(null);
  const { on, off } = useWebSocket();

  const addOutput = (entry) => {
    setOutput(prev => [...prev, entry]);
  };

  const clearOutput = () => {
    setOutput([]);
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