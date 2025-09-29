import { useState, useRef, useEffect } from 'react';
import { useOutput } from '../providers/OutputContext';
import { useProvider } from '../providers/ProviderContext';
import {
  MessageSquare,
  Play,
  Save,
  History,
  Zap,
  Target,
  BarChart3,
  Plus,
  Trash2,
  Copy,
  Eye,
  Settings,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function PromptEngineeringStudio() {
  const { addOutput } = useOutput();
  const { providers, activeProvider, switchProvider } = useProvider();

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    description: '',
    content: '',
    tags: []
  });

  // Fetch prompts from API
  const fetchPrompts = async () => {
    try {
      setLoading(true);
      console.log('Fetching prompts from /api/prompts');
      const response = await fetch('/api/prompts');
      console.log('Prompts response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Prompts data received:', data);
      setPrompts(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  const testPrompt = async () => {
    if (!selectedPrompt || !testInput.trim()) return;

    setIsTesting(true);
    addOutput({
      type: 'comment',
      content: `Testing prompt: ${selectedPrompt.name}`
    });

    // Simulate prompt testing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = {
      id: Date.now(),
      promptId: selectedPrompt.id,
      input: testInput,
      output: `This is a simulated response for testing "${selectedPrompt.name}".\n\nInput received: ${testInput.substring(0, 100)}...\n\nThe prompt would generate a comprehensive response based on the input and the prompt template.`,
      provider: activeProvider,
      responseTime: Math.floor(Math.random() * 2000) + 1000,
      timestamp: new Date().toISOString(),
      quality: Math.floor(Math.random() * 20) + 80 // 80-100
    };

    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

    addOutput({
      type: 'comment',
      content: `✅ Prompt test completed - Quality: ${result.quality}%`
    });

    setIsTesting(false);
  };

  const createPrompt = async () => {
    if (!newPrompt.name || !newPrompt.content) return;

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newPrompt.name,
          description: newPrompt.description,
          content: newPrompt.content,
          variables: {},
          tags: newPrompt.tags,
          category: 'coding'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdPrompt = await response.json();
      setPrompts(prev => [...prev, createdPrompt]);
      setNewPrompt({ name: '', description: '', content: '', tags: [] });
      setShowCreateForm(false);

      addOutput({
        type: 'comment',
        content: `✅ New prompt created: ${createdPrompt.name}`
      });
    } catch (err) {
      console.error('Failed to create prompt:', err);
      addOutput({
        type: 'comment',
        content: `❌ Failed to create prompt: ${err.message}`
      });
    }
  };

  const updatePrompt = (promptId, updates) => {
    setPrompts(prev => prev.map(prompt =>
      prompt.id === promptId ? { ...prompt, ...updates, lastModified: new Date().toISOString().split('T')[0] } : prompt
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
          Prompt Engineering Studio
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={activeProvider}
            onChange={(e) => switchProvider(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {Object.values(providers).map(provider => (
              <option key={provider.name} value={provider.name.toLowerCase().replace(' ', '_')}>
                {provider.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Prompt
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Prompts List */}
        <div className="lg:w-80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Prompt Library</h3>
            <button
              onClick={fetchPrompts}
              disabled={loading}
              className="p-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
              title="Refresh prompts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading prompts...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm text-red-400 mb-2">Failed to load prompts</p>
                <button
                  onClick={fetchPrompts}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Try again
                </button>
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400 opacity-50" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No prompts found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Create your first prompt to get started</p>
              </div>
            ) : (
              prompts.map(prompt => (
                <div
                  key={prompt.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPrompt?.id === prompt.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedPrompt(prompt)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {prompt.name}
                    </span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      v{prompt.version}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {prompt.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {prompt.tags.map(tag => (
                      <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>
                      <BarChart3 className="w-3 h-3 inline mr-1" />
                      {prompt.metrics.successRate}%
                    </div>
                    <div>
                      <Zap className="w-3 h-3 inline mr-1" />
                      {Math.round(prompt.metrics.avgResponseTime / 1000)}s
                    </div>
                    <div>
                      <Target className="w-3 h-3 inline mr-1" />
                      {prompt.metrics.usageCount}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prompt Editor & Testing */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedPrompt ? (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{selectedPrompt.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                      <History className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={selectedPrompt.content}
                  onChange={(e) => updatePrompt(selectedPrompt.id, { content: e.target.value })}
                  className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
                  placeholder="Enter your prompt template here..."
                />
              </div>

              {/* Testing Section */}
              <div className="flex-1 flex flex-col min-h-0">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Test Prompt</h4>

                <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                  {/* Test Input */}
                  <div className="lg:w-1/2 flex flex-col">
                    <textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder="Enter test input for the prompt..."
                      className="flex-1 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none min-h-0"
                    />
                    <button
                      onClick={testPrompt}
                      disabled={isTesting || !testInput.trim()}
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                    >
                      {isTesting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Test Prompt
                        </>
                      )}
                    </button>
                  </div>

                  {/* Test Results */}
                  <div className="lg:w-1/2 flex flex-col">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Recent Test Results</h5>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden min-h-0">
                      <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                        {testResults.length === 0 ? (
                          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No test results yet</p>
                            <p className="text-xs">Enter input and click "Test Prompt"</p>
                          </div>
                        ) : (
                          testResults.map(result => (
                            <div key={result.id} className="bg-white dark:bg-gray-800 p-3 rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(result.timestamp).toLocaleString()}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                    {result.quality}% quality
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {result.provider}
                                  </span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white mb-2">
                                <strong>Input:</strong> {result.input.substring(0, 100)}...
                              </div>
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Output:</strong> {result.output.substring(0, 200)}...
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Prompt</h3>
                <p className="text-sm">Choose a prompt from the library to edit and test it.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Prompt Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Create New Prompt</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Prompt name"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Description"
                value={newPrompt.description}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <textarea
                placeholder="Prompt content"
                value={newPrompt.content}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, content: e.target.value }))}
                className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createPrompt}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}