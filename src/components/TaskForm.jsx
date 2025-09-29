import { useState } from "react";
import { useTask } from "../providers/TaskContext";
import {
  Plus,
  X,
  Link,
  FileText,
  Tag,
  Code,
  Upload,
  Globe,
  Hash,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function TaskForm() {
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const { startTaskPolling } = useTask();

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
  const [repository, setRepository] = useState("");
  const [branch, setBranch] = useState("main");
  const [additionalContext, setAdditionalContext] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);

    try {
      // Prepare task data with context
      const taskData = {
        description: task.trim()
      };

      // Add context if showAdvanced is true
      if (showAdvanced) {
        taskData.context = {
          priority,
          tags,
          links,
          codeSnippets,
          files,
          repository,
          branch,
          additionalContext
        };
        console.log('Sending task with context:', taskData);
      } else {
        console.log('Sending task without context:', taskData);
      }

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
        console.log('Starting polling for task:', result.task_id);
        setTask("");

        // Start polling for task status updates
        if (result.task_id) {
          startTaskPolling(result.task_id);
        }
      } else {
        console.error('Failed to create task:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (err) {
      console.error('Task submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addLink = () => {
    if (newLink.trim()) {
      setLinks([...links, { url: newLink.trim(), title: "" }]);
      setNewLink("");
    }
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const addCodeSnippet = () => {
    if (newCodeSnippet.trim()) {
      setCodeSnippets([...codeSnippets, { code: newCodeSnippet.trim(), language: codeLanguage }]);
      setNewCodeSnippet("");
    }
  };

  const removeCodeSnippet = (index) => {
    setCodeSnippets(codeSnippets.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const clearAllContext = () => {
    setPriority("medium");
    setTags([]);
    setLinks([]);
    setCodeSnippets([]);
    setFiles([]);
    setRepository("");
    setBranch("main");
    setAdditionalContext("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-500" />
          Submit Task
        </h2>
        <div className="flex items-center space-x-2">
          {!showAdvanced && (
            <button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Context
            </button>
          )}
          {showAdvanced && (
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center"
            >
              <ChevronUp className="w-4 h-4 mr-1" />
              Hide Context
            </button>
          )}
          <button
            type="button"
            onClick={clearAllContext}
            className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Basic Task Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Task Description *
        </label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your task in detail..."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          rows="4"
          required
        />
      </div>

      {/* Advanced Context Options */}
      {showAdvanced && (
        <div className="space-y-6 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    onClick={() => removeTag(tag)}
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
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Related Links
            </label>
            <div className="space-y-2 mb-2">
              {links.map((link, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {link.url}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="p-1 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="button"
                onClick={addLink}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
                <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {snippet.language}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCodeSnippet(index)}
                      className="p-1 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="text-sm overflow-x-auto bg-gray-100 dark:bg-gray-900 p-2 rounded font-mono">
                    {snippet.code}
                  </pre>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="typescript">TypeScript</option>
                <option value="bash">Bash</option>
                <option value="sql">SQL</option>
              </select>
              <textarea
                value={newCodeSnippet}
                onChange={(e) => setNewCodeSnippet(e.target.value)}
                placeholder="Paste your code snippet here..."
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm resize-none"
              />
              <button
                type="button"
                onClick={addCodeSnippet}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center"
              >
                <Code className="w-4 h-4 mr-2" />
                Add Code Snippet
              </button>
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Attachments
            </label>
            <div className="space-y-2 mb-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="flex-1 text-sm text-gray-900 dark:text-white">{file.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>

          {/* Repository Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repository
              </label>
              <input
                type="text"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
                placeholder="owner/repo or full URL"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main, develop, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Context
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Any additional context, requirements, or constraints..."
              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !task.trim()}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none"
      >
        <span className="flex items-center justify-center">
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {loading ? "Submitting..." : "Submit Task"}
        </span>
      </button>
    </form>
  );
}
