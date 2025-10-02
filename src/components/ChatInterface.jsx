import { useState, useRef, useEffect } from "react";
import { useTask } from "../providers/TaskContext";
import { useOutput } from "../providers/OutputContext";
import { useWebSocket } from "../providers/WebSocketContext";
import {
  Send,
  History,
  FolderOpen,
  Code,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Bot,
  Zap,
  FileText,
  Settings,
  Plus,
  X,
  Link,
  Tag,
  Upload,
  Globe,
  Hash,
  MessageSquare,
  Play,
  Monitor,
  Upload as DeployIcon,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  CodeBlock,
  ResultPanel,
  DownloadCard,
  ZipDownloadCard,
  EditableDocument,
  FilePreview,
  VisualRenderer,
  TextSummary
} from "./ai-outputs";
import { dataProcessor } from "../utils/dataProcessor";
import Terminal from "./Terminal";

export default function ChatInterface({ onToggleWorkspace, workspaceVisible, onExecuteCommand }) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(null);
  const [copiedConversation, setCopiedConversation] = useState(false);
  const [runningCode, setRunningCode] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [lastClassification, setLastClassification] = useState(null);
  // Removed compressedMessages state
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  // Context fields
  const [priority, setPriority] = useState("medium");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState("");
  const [codeSnippets, setCodeSnippets] = useState([]);
  const [newCodeSnippet, setNewCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [files, setFiles] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [newRepository, setNewRepository] = useState("");
  const [branch, setBranch] = useState("main");
  const [additionalContext, setAdditionalContext] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [showTerminal, setShowTerminal] = useState(false);

  const { startTaskPolling, taskStatus, progress } = useTask();
  const { output, addOutput, clearOutput } = useOutput();
  const { isConnected } = useWebSocket();



  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output]);


  // Send message function
  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsTyping(true);
    setIsClassifying(true);

    try {
      // Prepare task data with context
      const taskData = {
        description: message.trim(),
        selectedAgent: selectedAgent !== "auto" ? selectedAgent : undefined
      };

      // Add context if available
      if (showContext && (priority !== "medium" || tags.length > 0 || links.length > 0 ||
          codeSnippets.length > 0 || files.length > 0 || repositories.length > 0 || additionalContext.trim())) {
        taskData.context = {
          priority,
          tags,
          links,
          codeSnippets,
          files,
          repositories,
          branch,
          additionalContext
        };
      }

      // Add user message to output
      addOutput({
        type: 'user',
        content: message.trim(),
        timestamp: new Date().toISOString()
      });

      // Create task via HTTP API
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Task created:', result);

        // Store classification info for display
        if (result.classification) {
          setLastClassification(result.classification);
        }

        // Clear input
        setMessage("");

        // Handle different response types from the classifier
        if (result.type === 'direct_response') {
          // Direct conversational response - process through data processor
          const processedContent = dataProcessor.process(result.response, { source: 'direct' });
          addOutput({
            type: 'ai',
            content: result.response,
            aiOutput: processedContent,
            timestamp: new Date().toISOString()
          });
        } else if (result.type === 'about_response') {
          // About system response - process through data processor
          const processedContent = dataProcessor.process(result.response, { source: 'about' });
          addOutput({
            type: 'ai',
            content: result.response,
            aiOutput: processedContent,
            timestamp: new Date().toISOString()
          });
        } else if (result.type === 'query_response') {
          // AI-generated query response - process through data processor
          const processedContent = dataProcessor.process(result.response, { source: 'query' });
          addOutput({
            type: 'ai',
            content: result.response,
            aiOutput: processedContent,
            timestamp: new Date().toISOString()
          });
        } else if (result.task_id) {
          // Regular task - start polling for updates
          startTaskPolling(result.task_id, message.trim());
        }
      } else {
        console.error('Failed to create task:', response.status);
        addOutput({
          type: 'error',
          content: 'Failed to send message. Please try again.'
        });
      }
    } catch (err) {
      console.error('Message send failed:', err);
      addOutput({
        type: 'error',
        content: 'Failed to send message. Please check your connection.'
      });
    } finally {
      setIsTyping(false);
      setIsClassifying(false);
    }
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll functions
  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  // Removed toggleMessageCompression function


  // Notification system
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Extract clean code from markdown-formatted text
  const extractCodeFromMarkdown = (markdownText) => {
    // Extract code blocks from markdown
    const codeBlockRegex = /```[\w]*\n?([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;

    while ((match = codeBlockRegex.exec(markdownText)) !== null) {
      codeBlocks.push(match[1].trim());
    }

    // If we found code blocks, return them joined
    if (codeBlocks.length > 0) {
      return codeBlocks.join('\n\n');
    }

    // If no code blocks found, try to extract content after **filename:** patterns
    const fileRegex = /\*\*[\w\.]+\*\*:\s*\n```[\w]*\n?([\s\S]*?)```/g;
    const fileBlocks = [];
    while ((match = fileRegex.exec(markdownText)) !== null) {
      fileBlocks.push(match[1].trim());
    }

    if (fileBlocks.length > 0) {
      return fileBlocks.join('\n\n');
    }

    // Fallback: return the original text if no code patterns found
    return markdownText;
  };

  // Copy text to clipboard with fallback for older browsers
  const copyToClipboard = async (text, type = 'message') => {
    try {
      // For messages with markdown formatting, extract clean code
      let textToCopy = text;
      if (type === 'message' && text.includes('```')) {
        textToCopy = extractCodeFromMarkdown(text);
      }

      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error('Fallback copy method failed');
        }
      }

      // Success feedback
      if (type === 'message') {
        setCopiedMessage(text);
        setTimeout(() => setCopiedMessage(null), 2000);
        addNotification('Message copied to clipboard', 'success');
      } else if (type === 'code') {
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
        addNotification('Code copied to clipboard', 'success');
      } else if (type === 'conversation') {
        // No state update needed for conversation copy
        addNotification('Conversation copied to clipboard', 'success');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      addNotification('Failed to copy to clipboard. Please try selecting and copying manually.', 'error');
    }
  };

  // Copy entire conversation
  const copyConversation = async () => {
    const conversationText = output.map(msg => {
      const prefix = msg.type === 'user' ? 'You: ' : 'AI: ';

      // For AI messages with processed output, extract clean code from explanatory summary
      if (msg.type === 'ai' && msg.aiOutput && msg.aiOutput.explanatory_summary) {
        const cleanCode = extractCodeFromMarkdown(msg.aiOutput.explanatory_summary);
        return prefix + cleanCode;
      }

      // Fallback to content
      return prefix + (typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2));
    }).join('\n\n');

    try {
      // Use the improved copy function
      await copyToClipboard(conversationText, 'conversation');
      setCopiedConversation(true);
      setTimeout(() => setCopiedConversation(false), 2000);
      addNotification('Conversation copied to clipboard', 'success');
    } catch (err) {
      console.error('Failed to copy conversation:', err);
      addNotification('Failed to copy conversation', 'error');
    }
  };

  // Helper function to format objects for display
  const formatObjectForDisplay = (obj) => {
    if (obj === null) return "null";
    if (obj === undefined) return "undefined";

    const keys = Object.keys(obj);
    if (keys.length === 0) return "**Empty object**";

    let formatted = "**Response Data:**\n\n";
    for (const [key, value] of Object.entries(obj)) {
      const keyStr = `**${key}:** `;
      let valueStr;

      if (value === null) {
        valueStr = "null";
      } else if (value === undefined) {
        valueStr = "undefined";
      } else if (typeof value === 'string') {
        valueStr = `"${value}"`;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        valueStr = String(value);
      } else if (Array.isArray(value)) {
        valueStr = `Array with ${value.length} items`;
      } else if (typeof value === 'object') {
        valueStr = `Object with ${Object.keys(value).length} properties`;
      } else {
        valueStr = String(value);
      }

      formatted += `${keyStr}${valueStr}\n`;
    }

    formatted += `\n**Full JSON:**\n\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``;
    return formatted;
  };

  // Process message content using standardized data processor
  const processMessageContent = (msg) => {
    try {
      // Don't process user messages through data processor - keep them as plain text
      if (msg.type === 'user') {
        return msg;
      }

      // Don't process messages that already have aiOutput
      if (msg.aiOutput) {
        return msg;
      }

      // Process the content using the data processor for AI messages
      let aiOutput = null;

      if (typeof msg.content === 'string') {
        const trimmed = msg.content.trim();

        // First try to parse the entire content as JSON
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            aiOutput = dataProcessor.process(parsed, { source: 'websocket' });
          } catch (e) {
            // Try to extract JSON from the string
            const jsonMatch = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[1]);
                aiOutput = dataProcessor.process(parsed, { source: 'websocket' });
              } catch (e2) {
                // Process as text
                aiOutput = dataProcessor.process(msg.content, { source: 'text' });
              }
            } else {
              aiOutput = dataProcessor.process(msg.content, { source: 'text' });
            }
          }
        } else {
          // Check if the string contains JSON-like content
          const jsonMatch = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[1]);
              aiOutput = dataProcessor.process(parsed, { source: 'websocket' });

              // If there's additional text after the JSON, append it
              const afterJson = trimmed.substring(jsonMatch.index + jsonMatch[0].length).trim();
              if (afterJson && aiOutput && aiOutput.explanatory_summary) {
                aiOutput.explanatory_summary += '\n\n' + afterJson;
              }
            } catch (e) {
              aiOutput = dataProcessor.process(msg.content, { source: 'text' });
            }
          } else {
            aiOutput = dataProcessor.process(msg.content, { source: 'text' });
          }
        }
      } else if (typeof msg.content === 'object' && msg.content !== null) {
        // Process objects directly - this handles WebSocket messages that come as objects
        aiOutput = dataProcessor.process(msg.content, { source: 'object' });
      }

      // Validate and return processed message
      if (aiOutput && Object.keys(aiOutput).length > 0) {
        return { ...msg, aiOutput: dataProcessor.validateOutput(aiOutput) };
      }

      return msg;
    } catch (error) {
      console.warn('Error processing message content:', error);
      // Return original message with error indication
      return {
        ...msg,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2),
        processingError: true
      };
    }
  };

  // Render message content based on type
  const renderMessage = (msg, index) => {
    // For user messages, don't process through data processor
    const isUser = msg.type === 'user';
    const processedMsg = isUser ? msg : processMessageContent(msg);

    const isAI = processedMsg.type === 'ai';
    const isCode = processedMsg.type === 'code';
    const isError = processedMsg.type === 'error';
    const isComment = processedMsg.type === 'comment';

    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6 px-2 sm:px-4 animate-in slide-in-from-bottom-2 duration-300`}>
        <div className={`flex w-full max-w-[95%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] 2xl:max-w-[50%] ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
            {isUser ? (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Message content */}
          <div className={`relative rounded-lg px-4 py-3 w-full max-w-[85%] sm:max-w-[75%] break-words overflow-hidden ${
            isUser
              ? 'bg-blue-600 text-white'
              : isError
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}>
            {/* Message tail */}
            <div className={`absolute top-4 w-2 h-2 transform rotate-45 ${
              isUser
                ? '-right-1 bg-blue-600'
                : isError
                  ? '-left-1 bg-red-50 dark:bg-red-900/20 border-l border-t border-red-200 dark:border-red-800'
                  : '-left-1 bg-gray-100 dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700'
            }`} />
            {isAI && processedMsg.aiOutput ? (
              <div className="space-y-4">

                {/* Clean AI response display */}
                {processedMsg.aiOutput.explanatory_summary && (
                  <div className="prose prose-xs max-w-none dark:prose-invert leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              className="overflow-x-auto max-w-full my-2"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={`${className} bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono`} {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre({ children, ...props }) {
                          // Don't render pre tags for syntax highlighted code blocks
                          return null;
                        },
                        p({ children, ...props }) {
                          return (
                            <p className="mb-2 last:mb-0" {...props}>
                              {children}
                            </p>
                          );
                        }
                      }}
                    >
                      {processedMsg.aiOutput.explanatory_summary}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Show file delivery if no explanatory summary or as additional content */}
                {processedMsg.aiOutput.file_delivery && processedMsg.aiOutput.file_delivery.length > 0 && (
                  <div className="mt-4">
                    <DownloadCard files={processedMsg.aiOutput.file_delivery} />
                  </div>
                )}

                {/* ZIP Download for multi-file projects */}
                {(processedMsg.aiOutput.zip_download_url || processedMsg.aiOutput.zip_download_urls) && (
                  <div className="mt-4">
                    <ZipDownloadCard
                      downloadUrl={processedMsg.aiOutput.zip_download_url || processedMsg.aiOutput.zip_download_urls[0]}
                      filename={processedMsg.aiOutput.zip_filename || "project.zip"}
                      fileCount={processedMsg.aiOutput.file_delivery ? processedMsg.aiOutput.file_delivery.length : 0}
                    />
                  </div>
                )}

                {/* Show executed results if present */}
                {processedMsg.aiOutput.executed_results && (
                  <div className="mt-4">
                    <ResultPanel results={processedMsg.aiOutput.executed_results} />
                  </div>
                )}

                {/* Show visual output if present */}
                {processedMsg.aiOutput.visual_output && (
                  <div className="mt-4">
                    <VisualRenderer data={processedMsg.aiOutput.visual_output} />
                  </div>
                )}
              </div>
            ) : isCode ? (
              <CodeBlock
                code={processedMsg.content}
                language={processedMsg.language || 'python'}
                onCopy={() => copyToClipboard(processedMsg.content, 'code')}
                copied={copiedCode === processedMsg.content}
              />
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert break-words overflow-hidden" style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline ? (
                        <div className="overflow-x-auto max-w-full">
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match ? match[1] : 'text'}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={`${className} break-words`} {...props} style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word'
                        }}>
                          {children}
                        </code>
                      );
                    },
                    pre({ children, ...props }) {
                      return (
                        <pre className="overflow-x-auto max-w-full break-words" {...props}>
                          {children}
                        </pre>
                      );
                    },
                    p({ children, ...props }) {
                      return (
                        <p className="break-words" style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word'
                        }} {...props}>
                          {children}
                        </p>
                      );
                    }
                  }}
                >
                  {typeof processedMsg.content === 'string' ? processedMsg.content : formatObjectForDisplay(processedMsg.content)}
                </ReactMarkdown>
              </div>
            )}

            {/* Message actions */}
            {!isUser && (
              <div className="flex items-center justify-end mt-2 space-x-2">
                <button
                  onClick={() => copyToClipboard(
                    processedMsg.aiOutput && processedMsg.aiOutput.explanatory_summary
                      ? processedMsg.aiOutput.explanatory_summary
                      : (typeof processedMsg.content === 'string' ? processedMsg.content : JSON.stringify(processedMsg.content, null, 2))
                  )}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-gray-900 transition-colors relative flex flex-col overflow-x-hidden">
      {/* Clean Notifications */}
      <div className="absolute top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-md border animate-in slide-in-from-right duration-300 ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
                : notification.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {notification.type === 'error' && <XCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Sidebar - Mobile First */}
      <div className={`${
        showHistory || showProjects || showContext ? 'w-full sm:w-80' : 'w-0'
      } transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}>
        {/* History Panel */}
        {showHistory && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Task History</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              {taskHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet</p>
                </div>
              ) : (
                taskHistory.map((task, index) => (
                  <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2">{task.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(task.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Projects Panel */}
        {showProjects && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Projects</h3>
              </div>
              <button
                onClick={() => setShowProjects(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FolderOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No projects yet</p>
                </div>
              ) : (
                projects.map((project, index) => (
                  <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Context Panel */}
        {showContext && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Context</h3>
              </div>
              <button
                onClick={() => setShowContext(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter(t => t !== tag))}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), setTags([...tags, newTag.trim()]), setNewTag(''))}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => { setTags([...tags, newTag.trim()]); setNewTag(''); }}
                    className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Repositories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repositories
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {repositories.map((repo, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      <Globe className="w-3 h-3 mr-1" />
                      {repo}
                      <button
                        type="button"
                        onClick={() => setRepositories(repositories.filter((_, i) => i !== index))}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newRepository}
                    onChange={(e) => setNewRepository(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), setRepositories([...repositories, newRepository.trim()]), setNewRepository(''))}
                    placeholder="owner/repo or https://github.com/owner/repo"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => { setRepositories([...repositories, newRepository.trim()]); setNewRepository(''); }}
                    className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Links
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {links.map((link, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      <Link className="w-3 h-3 mr-1" />
                      {link}
                      <button
                        type="button"
                        onClick={() => setLinks(links.filter((_, i) => i !== index))}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), setLinks([...links, newLink.trim()]), setNewLink(''))}
                    placeholder="https://example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => { setLinks([...links, newLink.trim()]); setNewLink(''); }}
                    className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Code Snippets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code Snippets
                </label>
                <div className="space-y-2 mb-2">
                  {codeSnippets.map((snippet, index) => (
                    <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      <div className="flex justify-between items-start">
                        <code className="text-xs text-gray-600 dark:text-gray-400 flex-1">{snippet}</code>
                        <button
                          type="button"
                          onClick={() => setCodeSnippets(codeSnippets.filter((_, i) => i !== index))}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <textarea
                    value={newCodeSnippet}
                    onChange={(e) => setNewCodeSnippet(e.target.value)}
                    placeholder="Add code snippet..."
                    rows="2"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => { setCodeSnippets([...codeSnippets, newCodeSnippet.trim()]); setNewCodeSnippet(''); }}
                    className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm self-end"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Files */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Files
                </label>
                <div className="space-y-2 mb-2">
                  {files.map((file, index) => (
                    <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded border flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                        <span className="text-xs text-gray-500">({file.size || 'Unknown size'})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files);
                      const newFiles = selectedFiles.map(file => ({
                        name: file.name,
                        size: `${(file.size / 1024).toFixed(1)} KB`,
                        type: file.type,
                        file: file // Keep the actual file object for upload
                      }));
                      setFiles([...files, ...newFiles]);
                      e.target.value = ''; // Reset input
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 dark:file:bg-gray-600 dark:file:text-gray-200"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upload reference files, documentation, or assets
                </p>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Context
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Any additional context or instructions..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 w-full flex flex-col min-h-0 px-2 sm:px-4 pb-16 lg:pb-4 overflow-y-auto mx-auto max-w-full md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-8xl">
        {/* Clean Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Status Indicator */}
            {isClassifying && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300">Processing</span>
              </div>
            )}

            {taskStatus !== 'Idle' && !isClassifying && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                {taskStatus === 'Running' && <Clock className="w-4 h-4 text-blue-500 animate-pulse" />}
                {taskStatus === 'Completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {taskStatus === 'Failed' && <XCircle className="w-4 h-4 text-red-500" />}
                <span className="text-sm text-gray-700 dark:text-gray-300">{taskStatus}</span>
                {progress > 0 && (
                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 ml-2">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Essential Actions */}
            <button
              onClick={() => setShowContext(!showContext)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                showContext
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title="Context & Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleWorkspace}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 text-gray-600 dark:text-gray-400"
              title={workspaceVisible ? "Hide Workspace" : "Show Workspace"}
            >
              <Code className="w-5 h-5" />
            </button>

            <button
              onClick={copyConversation}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                copiedConversation
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title="Copy Conversation"
            >
              {copiedConversation ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className={`flex-1 flex flex-col ${output.length === 0 ? 'justify-center' : ''}`}>
          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className={`${output.length === 0 ? '' : 'flex-1'} overflow-y-auto p-2 sm:p-4 space-y-4 min-h-0 scrollbar-hide relative`}
          >
            {output.length === 0 ? (
              <div className="flex items-center justify-center h-full px-4">
                <div className="text-center max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Welcome to B2.0
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Your AI development assistant. Ready to help with coding, debugging, and more.
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Code className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">Write & fix code</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Play className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Run & test code</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">Analyze files</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Scroll to top button */}
                <button
                  onClick={scrollToTop}
                  className="fixed bottom-24 right-6 z-40 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center opacity-75 hover:opacity-100"
                  title="Scroll to top"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>

                {/* Scroll to bottom button */}
                <button
                  onClick={scrollToBottom}
                  className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center opacity-75 hover:opacity-100"
                  title="Scroll to bottom"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>

                {output.map((msg, index) => renderMessage(msg, index))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {isTyping && (
            <div className="px-4 py-2">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Bot className="w-4 h-4" />
                <span className="text-sm">AI is typing...</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Terminal Panel */}
          {showTerminal && onExecuteCommand && (
            <div className="bg-gray-900 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <DeployIcon className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Terminal</span>
                </div>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="h-64">
                <Terminal onExecuteCommand={onExecuteCommand} />
              </div>
            </div>
          )}

          {/* Clean Input Area */}
          <div className={`bg-white dark:bg-gray-800 ${output.length === 0 ? '' : 'border-t'} border-gray-200 dark:border-gray-700 p-4 ${output.length === 0 ? 'max-w-full sm:max-w-2xl mx-auto w-full' : ''}`}>
            <div className="flex items-end space-x-3 max-w-full sm:max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  rows="1"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
              </div>

              {/* Agent Selection and Terminal Toggle */}
              <div className="flex flex-col space-y-2">
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Select agent (auto = automatic classification)"
                >
                  <option value="auto">Auto</option>
                  <option value="fix_implementation_agent">Fix Implementation</option>
                  <option value="debugger_agent">Debugger</option>
                  <option value="review_agent">Review</option>
                  <option value="testing_agent">Testing</option>
                  <option value="security_agent">Security</option>
                  <option value="performance_agent">Performance</option>
                  <option value="deployment_agent">Deployment</option>
                  <option value="monitoring_agent">Monitoring</option>
                  <option value="feedback_agent">Feedback</option>
                  <option value="comparator_service">Comparator Service</option>
                  <option value="task_classifier">Task Classifier</option>
                  <option value="web_scraper">Web Scraper</option>
                  <option value="architecture">Architecture</option>
                </select>

                {onExecuteCommand && (
                  <button
                    onClick={() => setShowTerminal(!showTerminal)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      showTerminal
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={showTerminal ? "Hide Terminal" : "Show Terminal"}
                  >
                    <DeployIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={sendMessage}
                disabled={!message.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
                title="Send message"
              >
                {isTyping ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}