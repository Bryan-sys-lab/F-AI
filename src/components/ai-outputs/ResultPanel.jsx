import { useState } from "react";
import { ChevronDown, ChevronUp, Terminal, AlertCircle } from "lucide-react";

export default function ResultPanel({ code, executionOutput, language, exitCode, error }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasError = error || exitCode !== 0;
  const outputLines = executionOutput ? executionOutput.split('\n') : [];

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl rounded-tl-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Execution Output
          </span>
          {hasError && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${
            hasError
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}>
            Exit Code: {exitCode}
          </span>
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {!isCollapsed && (
        <div className="px-4 pb-4">
          <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 dark:text-green-300 max-h-96 overflow-auto">
            {outputLines.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {line || '\n'}
              </div>
            ))}
            {outputLines.length === 0 && (
              <div className="text-gray-500 italic">No output</div>
            )}
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}