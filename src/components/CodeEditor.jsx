import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

export default function CodeEditor({ file, onSave, onClose }) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (file) {
      loadFileContent(file.path);
    }
  }, [file]);

  const loadFileContent = async (filePath) => {
    try {
      const response = await fetch(`/api/workspace/files/${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const data = await response.json();
        const fileContent = data.content || '';
        setContent(fileContent);
        setOriginalContent(fileContent);
        setHasChanges(false);
      } else {
        // Fallback to mock content
        const mockContent = getMockFileContent(filePath);
        setContent(mockContent);
        setOriginalContent(mockContent);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to load file content:', error);
      // Fallback to mock content
      const mockContent = getMockFileContent(filePath);
      setContent(mockContent);
      setOriginalContent(mockContent);
      setHasChanges(false);
    }
  };

  const getMockFileContent = (path) => {
    // Mock file contents for demo
    const contents = {
      '/src/components/App.js': `import React, { useState } from 'react';
import Header from './Header';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Header />
      <main>
        <h1>Counter: {count}</h1>
        <button onClick={() => setCount(count + 1)}>
          Increment
        </button>
      </main>
    </div>
  );
}

export default App;`,
      '/src/components/Header.jsx': `import React from 'react';

function Header() {
  return (
    <header>
      <h1>My App</h1>
    </header>
  );
}

export default Header;`,
      '/src/index.js': `import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

ReactDOM.render(<App />, document.getElementById('root'));`,
      '/package.json': `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`,
      '/README.md': `# My App

This is a sample React application.

## Getting Started

1. Install dependencies: \`npm install\`
2. Start the app: \`npm start\``
    };
    return contents[path] || '// File content not available';
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasChanges(newContent !== originalContent);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(file.path, content);
      setOriginalContent(content);
      setHasChanges(false);
    }
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <p className="text-lg font-medium">No file selected</p>
          <p className="text-sm">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {file.name}
          </h3>
          {hasChanges && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close file"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={handleContentChange}
          className="w-full h-full p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-0 resize-none focus:outline-none"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            tabSize: 2
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}