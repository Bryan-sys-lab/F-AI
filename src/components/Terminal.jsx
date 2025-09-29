import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Play, Square, Trash2 } from "lucide-react";

export default function Terminal({ onExecuteCommand }) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([
    { type: 'output', content: 'Welcome to the integrated terminal!' },
    { type: 'output', content: 'Type commands to interact with your project.' },
    { type: 'prompt', content: '$ ' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async () => {
    if (!command.trim() || isRunning) return;

    const cmd = command.trim();
    setCommand('');

    // Add command to history
    setHistory(prev => [...prev, { type: 'input', content: `$ ${cmd}` }]);
    setIsRunning(true);

    try {
      if (onExecuteCommand) {
        const result = await onExecuteCommand(cmd);
        setHistory(prev => [
          ...prev,
          { type: 'output', content: result.stdout || '' },
          ...(result.stderr ? [{ type: 'error', content: result.stderr }] : []),
          { type: 'prompt', content: '$ ' }
        ]);
      } else {
        // Mock execution for demo
        setTimeout(() => {
          setHistory(prev => [
            ...prev,
            { type: 'output', content: `Executed: ${cmd}` },
            { type: 'output', content: 'Command completed successfully.' },
            { type: 'prompt', content: '$ ' }
          ]);
          setIsRunning(false);
        }, 1000);
      }
    } catch (error) {
      setHistory(prev => [
        ...prev,
        { type: 'error', content: `Error: ${error.message}` },
        { type: 'prompt', content: '$ ' }
      ]);
    } finally {
      if (!onExecuteCommand) {
        setIsRunning(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const clearTerminal = () => {
    setHistory([
      { type: 'output', content: 'Terminal cleared.' },
      { type: 'prompt', content: '$ ' }
    ]);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm"
        style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
      >
        {history.map((line, index) => (
          <div key={index} className={`mb-1 ${
            line.type === 'error' ? 'text-red-400' :
            line.type === 'input' ? 'text-blue-400' :
            line.type === 'prompt' ? 'text-green-400' :
            'text-gray-300'
          }`}>
            {line.content}
            {line.type === 'prompt' && (
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-gray-100 ml-1 flex-1"
                autoFocus
                disabled={isRunning}
              />
            )}
          </div>
        ))}
        {isRunning && (
          <div className="text-yellow-400">
            Executing command... <span className="animate-pulse">▊</span>
          </div>
        )}
      </div>

      {/* Command Input (when not at prompt) */}
      {history.length > 0 && history[history.length - 1].type !== 'prompt' && !isRunning && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-green-400 font-mono">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              disabled={isRunning}
            />
            <button
              onClick={executeCommand}
              disabled={!command.trim() || isRunning}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center space-x-1"
            >
              {isRunning ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isRunning ? 'Running' : 'Run'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}