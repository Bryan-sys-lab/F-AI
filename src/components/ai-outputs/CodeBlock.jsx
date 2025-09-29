import { useState } from "react";
import { Copy, CheckCircle, Play, Clock } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ code, language, onRun, runningId, codeId }) {
  const [copied, setCopied] = useState(false);
  const isDark = document.documentElement.classList.contains("dark");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code, language, codeId);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 font-mono">
          {language || 'code'}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRun}
            disabled={runningId === codeId}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded transition-all duration-200"
            title="Run code in sandbox"
          >
            {runningId === codeId ? (
              <Clock className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            <span>{runningId === codeId ? 'Running...' : 'Run'}</span>
          </button>
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
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          background: "transparent",
          maxHeight: "400px",
          overflow: "auto"
        }}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}