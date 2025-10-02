import { useState, useRef, useEffect } from "react";
import { X, Upload, Terminal as TerminalIcon } from "lucide-react";
import ChatInterface from "./ChatInterface";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";
import GitHubDeployModal from "./GitHubDeployModal";

export default function IntegratedWorkspace() {
  const [workspaceVisible, setWorkspaceVisible] = useState(false); // toggle workspace visibility
  const [panelWidth, setPanelWidth] = useState(50); // percentage
  const [openFiles, setOpenFiles] = useState([]); // array of open files
  const [activeFileIndex, setActiveFileIndex] = useState(-1); // index of active file tab
  const [isResizing, setIsResizing] = useState(false);
  const [isTerminalResizing, setIsTerminalResizing] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const containerRef = useRef(null);
  const workspaceRef = useRef(null);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setPanelWidth(Math.max(30, Math.min(70, newWidth)));
  };


  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleFileSelect = (file) => {
    if (file.type === 'file') {
      // Auto-activate workspace when opening files
      setWorkspaceVisible(true);

      // Check if file is already open
      const existingIndex = openFiles.findIndex(f => f.path === file.path);
      if (existingIndex >= 0) {
        setActiveFileIndex(existingIndex);
      } else {
        setOpenFiles(prev => [...prev, file]);
        setActiveFileIndex(openFiles.length);
      }
    }
  };

  const toggleWorkspace = () => {
    setWorkspaceVisible(!workspaceVisible);
  };

  const handleCloseFile = (index) => {
    const newFiles = openFiles.filter((_, i) => i !== index);
    setOpenFiles(newFiles);

    if (activeFileIndex === index) {
      if (newFiles.length > 0) {
        setActiveFileIndex(Math.min(index, newFiles.length - 1));
      } else {
        setActiveFileIndex(-1);
      }
    } else if (activeFileIndex > index) {
      setActiveFileIndex(activeFileIndex - 1);
    }
  };

  const handleSaveFile = async (filePath, content) => {
    try {
      const response = await fetch(`/api/workspace/files/${encodeURIComponent(filePath)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (response.ok) {
        console.log('File saved successfully:', filePath);
      } else {
        console.error('Failed to save file:', response.status);
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleTerminalMouseDown = () => {
    setIsTerminalResizing(true);
  };


  const executeCommand = async (command) => {
    try {
      const response = await fetch('/api/shell_exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: command,
          working_dir: "/workspace",
          timeout: 30
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          stdout: result.stdout || '',
          stderr: result.stderr || '',
          exit_code: result.exit_code || 0
        };
      } else {
        throw new Error('Command execution failed');
      }
    } catch (error) {
      console.error('Terminal command failed:', error);
      return {
        stdout: '',
        stderr: `Error: ${error.message}`,
        exit_code: 1
      };
    }
  };

  const handleDeployToGitHub = async (deployData) => {
    try {
      const response = await fetch('/api/github/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deployData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Open the GitHub repository in a new tab
        window.open(result.repo_url, '_blank');
        return { success: true, repo_url: result.repo_url };
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error('GitHub deployment failed:', error);
      throw error;
    }
  };

  // Listen for deploy modal events
  useEffect(() => {
    const handleOpenDeployModal = () => {
      setShowDeployModal(true);
    };

    window.addEventListener('openDeployModal', handleOpenDeployModal);
    return () => window.removeEventListener('openDeployModal', handleOpenDeployModal);
  }, []);

  return (
    <div ref={containerRef} className="flex h-full w-full relative">
      {/* Chat Panel */}
      <div
        className={`flex-shrink-0 ${workspaceVisible ? 'border-r border-gray-200 dark:border-gray-700' : ''} ${
          workspaceVisible ? 'block' : 'block'
        }`}
        style={{
          width: workspaceVisible ? `${panelWidth}%` : '100%',
          minWidth: workspaceVisible ? '300px' : 'auto',
          maxWidth: workspaceVisible ? '70%' : '100%'
        }}
      >
        <ChatInterface onToggleWorkspace={toggleWorkspace} workspaceVisible={workspaceVisible} onExecuteCommand={executeCommand} />
      </div>

      {/* GitHub Deploy Modal */}
      <GitHubDeployModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        onDeploy={handleDeployToGitHub}
        workspacePath="/workspace"
      />

      {/* Resize Handle - Only show when workspace is visible */}
      {workspaceVisible && (
        <div
          className="w-1 bg-gray-200 dark:bg-gray-700 cursor-col-resize hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400 dark:group-hover:bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
        </div>
      )}

      {/* Workspace Panel - Only show when visible */}
      {workspaceVisible && (
        <div
          ref={workspaceRef}
          className="flex-1 bg-gray-50 dark:bg-gray-900 flex flex-col relative"
          style={{
            width: `${100 - panelWidth}%`,
            minWidth: '30%'
          }}
        >
        {/* File Tabs and Toolbar */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {/* File Tabs */}
          <div className="flex flex-1 overflow-x-auto">
            {openFiles.map((file, index) => (
              <div
                key={file.path}
                className={`flex items-center px-3 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  index === activeFileIndex
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setActiveFileIndex(index)}
              >
                <span className="text-sm truncate max-w-32">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseFile(index);
                  }}
                  className="ml-2 p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center space-x-1 px-2">
          </div>
        </div>

        {/* Editor and Terminal Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Editor Area */}
          <div
            className="flex-1 min-h-0"
            style={{ height: terminalVisible ? `${100 - terminalHeight}%` : '100%' }}
          >
            <div className="h-full flex">
              {/* File Explorer */}
              <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <FileExplorer onFileSelect={handleFileSelect} />
              </div>

              {/* Editor */}
              <div className="flex-1">
                {activeFileIndex >= 0 && openFiles[activeFileIndex] ? (
                  <CodeEditor
                    file={openFiles[activeFileIndex]}
                    onSave={handleSaveFile}
                    onClose={() => handleCloseFile(activeFileIndex)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📄</span>
                      </div>
                      <p className="text-lg font-medium">No file selected</p>
                      <p className="text-sm">Select a file from the explorer to start editing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      )}
    </div>
  );
}