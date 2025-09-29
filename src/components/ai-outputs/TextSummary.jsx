import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TextSummary({ summaryText, assumptions = [], limitations = [], improvements = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasExtraContent = assumptions.length > 0 || limitations.length > 0 || improvements.length > 0;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl rounded-tl-md border border-blue-200 dark:border-blue-800 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        {hasExtraContent && (
          isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="prose prose-sm dark:prose-invert max-w-none text-blue-900 dark:text-blue-100">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-blue-900 dark:text-blue-100">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-blue-900 dark:text-blue-100">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-blue-900 dark:text-blue-100">{children}</h3>,
              p: ({ children }) => <p className="mb-2 last:mb-0 text-blue-900 dark:text-blue-100">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 space-y-1 text-blue-900 dark:text-blue-100">{children}</ul>,
              li: ({ children }) => <li className="text-sm text-blue-900 dark:text-blue-100">• {children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-blue-900 dark:text-blue-100">{children}</strong>,
              em: ({ children }) => <em className="italic text-blue-900 dark:text-blue-100">{children}</em>,
              code: ({ inline, children }) => inline ? (
                <code className="bg-blue-100 dark:bg-blue-800/50 px-1.5 py-0.5 rounded text-xs font-mono text-blue-900 dark:text-blue-100">
                  {children}
                </code>
              ) : children,
            }}
          >
            {summaryText}
          </ReactMarkdown>
        </div>

        {!isCollapsed && hasExtraContent && (
          <div className="mt-4 space-y-3">
            {assumptions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Assumptions:
                </h4>
                <ul className="space-y-1">
                  {assumptions.map((assumption, index) => (
                    <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {limitations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Limitations:
                </h4>
                <ul className="space-y-1">
                  {limitations.map((limitation, index) => (
                    <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Potential Improvements:
                </h4>
                <ul className="space-y-1">
                  {improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}