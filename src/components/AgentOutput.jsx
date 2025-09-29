import { Copy, Trash2, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useOutput } from "../providers/OutputContext";
import { useWebSocket } from "../providers/WebSocketContext";
import { useEffect, useState } from "react";

export default function AgentOutput() {
  const { output, clearOutput, outputRef } = useOutput();
  const { emit } = useWebSocket();
  const [runningBlocks, setRunningBlocks] = useState(new Set());
  const isDark = document.documentElement.classList.contains("dark");

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const copyAll = () => {
    const plainText = output.map((o) => o.content).join("\n");
    navigator.clipboard.writeText(plainText);
  };

  const copyCodeBlock = (code) => {
    navigator.clipboard.writeText(code);
  };

  const runCodeBlock = async (code, language, index) => {
    setRunningBlocks(prev => new Set([...prev, index]));

    try {
      emit('execute', { code, language });
    } catch (err) {
      console.error('Code execution failed:', err);
    } finally {
      setRunningBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          B Output
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={copyAll}
            disabled={output.length === 0}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-40"
            title="Copy all output"
          >
            <Copy className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          </button>
          <button
            onClick={clearOutput}
            disabled={output.length === 0}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-40"
            title="Clear output"
          >
            <Trash2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto border border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm text-gray-700 dark:text-gray-300 space-y-4"
      >
        {output.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No output yet...</p>
        ) : (
          output.map((entry, idx) => (
            <div key={idx} className="mb-4">
              {entry.type === 'comment' ? (
                <div className="text-green-600 dark:text-green-400 italic border-l-4 border-green-500 pl-4 py-2">
                  💬 {entry.content}
                </div>
              ) : entry.type === 'code' ? (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {entry.language || 'code'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyCodeBlock(entry.content)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        title="Copy code"
                      >
                        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => runCodeBlock(entry.content, entry.language, idx)}
                        disabled={runningBlocks.has(idx)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
                        title="Run code"
                      >
                        {runningBlocks.has(idx) ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 text-blue-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <SyntaxHighlighter
                    style={isDark ? oneDark : oneLight}
                    language={entry.language}
                    PreTag="div"
                    customStyle={{ margin: 0, borderRadius: "0.5rem", padding: "1rem" }}
                  >
                    {entry.content}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const code = String(children).replace(/\n$/, "");
                      const match = /language-(\w+)/.exec(className || "");
                      if (!inline && match) {
                        return (
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {match[1]}
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => copyCodeBlock(code)}
                                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                  title="Copy code"
                                >
                                  <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={() => runCodeBlock(code, match[1], `${idx}-${match[1]}`)}
                                  disabled={runningBlocks.has(`${idx}-${match[1]}`)}
                                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
                                  title="Run code"
                                >
                                  {runningBlocks.has(`${idx}-${match[1]}`) ? (
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Play className="w-4 h-4 text-blue-500" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <SyntaxHighlighter
                              style={isDark ? oneDark : oneLight}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, borderRadius: "0.5rem", padding: "1rem" }}
                              {...props}
                            >
                              {code}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      return (
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {entry.content}
                </ReactMarkdown>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
