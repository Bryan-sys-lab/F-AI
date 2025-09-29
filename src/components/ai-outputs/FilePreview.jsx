import { useState } from "react";
import { Copy, CheckCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function FilePreview({ filePath, content, language }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isDark = document.documentElement.classList.contains("dark");

  // Detect language from file extension if not provided
  const detectLanguage = (path) => {
    const ext = path.split('.').pop().toLowerCase();
    const langMap = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sh: 'bash',
      sql: 'sql'
    };
    return langMap[ext] || 'text';
  };

  const fileLanguage = language || detectLanguage(filePath);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const lines = content.split('\n').length;
  const shouldCollapse = lines > 50;
  const displayContent = shouldCollapse && !expanded ? content.split('\n').slice(0, 50).join('\n') + '\n...' : content;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 font-mono truncate max-w-xs">
            {filePath}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({lines} lines)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {shouldCollapse && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-all duration-200 text-gray-700 dark:text-gray-300"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{expanded ? 'Collapse' : 'Expand'}</span>
            </button>
          )}
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded transition-all duration-200 text-gray-700 dark:text-gray-300"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            )}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={fileLanguage}
        PreTag="div"
        showLineNumbers={true}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          background: "transparent",
          maxHeight: expanded ? "none" : "400px",
          overflow: "auto"
        }}
        wrapLongLines={true}
        lineNumberStyle={{
          minWidth: '3em',
          paddingRight: '1em',
          color: isDark ? '#6b7280' : '#9ca3af',
          borderRight: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          marginRight: '1em',
          textAlign: 'right',
          userSelect: 'none'
        }}
      >
        {displayContent}
      </SyntaxHighlighter>
    </div>
  );
}