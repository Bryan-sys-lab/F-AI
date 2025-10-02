import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";

export default function FileExplorer({ onFileSelect }) {
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['/']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      // Try to load from backend API first
      const response = await fetch('/api/workspace/files');
      let workspaceFiles = [];
      if (response.ok) {
        const data = await response.json();
        workspaceFiles = data.files || [];
      } else {
        // Fallback to mock data
        workspaceFiles = [
          {
            name: 'src',
            type: 'directory',
            path: '/src',
            children: [
              { name: 'components', type: 'directory', path: '/src/components', children: [
                { name: 'App.js', type: 'file', path: '/src/components/App.js' },
                { name: 'Header.jsx', type: 'file', path: '/src/components/Header.jsx' }
              ]},
              { name: 'utils', type: 'directory', path: '/src/utils', children: [
                { name: 'helpers.js', type: 'file', path: '/src/utils/helpers.js' }
              ]},
              { name: 'index.js', type: 'file', path: '/src/index.js' }
            ]
          },
          { name: 'package.json', type: 'file', path: '/package.json' },
          { name: 'README.md', type: 'file', path: '/README.md' }
        ];
      }

      // Try to load generated files
      let generatedFiles = [];
      try {
        const generatedResponse = await fetch('/api/workspace/generated-files');
        if (generatedResponse.ok) {
          const generatedData = await generatedResponse.json();
          generatedFiles = generatedData.files || [];
        }
      } catch (error) {
        console.log('No generated files available:', error);
      }

      // Combine workspace files and generated files
      let combinedFiles = [...workspaceFiles];

      if (generatedFiles.length > 0) {
        // Add generated files as a special directory
        const generatedDir = {
          name: 'generated',
          type: 'directory',
          path: '/generated',
          children: generatedFiles.map(file => ({
            ...file,
            path: `/generated/${file.name}`
          }))
        };
        combinedFiles.push(generatedDir);
      }

      setFiles(combinedFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
      // Fallback to mock data
      const mockFiles = [
        {
          name: 'src',
          type: 'directory',
          path: '/src',
          children: [
            { name: 'components', type: 'directory', path: '/src/components', children: [
              { name: 'App.js', type: 'file', path: '/src/components/App.js' },
              { name: 'Header.jsx', type: 'file', path: '/src/components/Header.jsx' }
            ]},
            { name: 'utils', type: 'directory', path: '/src/utils', children: [
              { name: 'helpers.js', type: 'file', path: '/src/utils/helpers.js' }
            ]},
            { name: 'index.js', type: 'file', path: '/src/index.js' }
          ]
        },
        { name: 'package.json', type: 'file', path: '/package.json' },
        { name: 'README.md', type: 'file', path: '/README.md' }
      ];
      setFiles(mockFiles);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => {
      const isExpanded = expandedFolders.has(item.path);
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={item.path}>
          <div
            className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm ${
              level > 0 ? 'ml-4' : ''
            }`}
            onClick={() => {
              if (item.type === 'directory') {
                toggleFolder(item.path);
              } else {
                onFileSelect && onFileSelect(item);
              }
            }}
          >
            {item.type === 'directory' ? (
              <>
                {hasChildren ? (
                  isExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />
                ) : (
                  <div className="w-4 h-4 mr-1" />
                )}
                {isExpanded ? <FolderOpen className="w-4 h-4 mr-2 text-blue-500" /> : <Folder className="w-4 h-4 mr-2 text-blue-500" />}
              </>
            ) : (
              <>
                <div className="w-4 h-4 mr-1" />
                <File className="w-4 h-4 mr-2 text-gray-500" />
              </>
            )}
            <span className="truncate">{item.name}</span>
          </div>
          {item.type === 'directory' && isExpanded && hasChildren && (
            <div>
              {renderFileTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 ml-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded ml-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Project Files
        </h3>
        {files.length > 0 ? (
          renderFileTree(files)
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No files found
          </div>
        )}
      </div>
    </div>
  );
}