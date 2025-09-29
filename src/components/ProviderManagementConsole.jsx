import { useProvider } from "../providers/ProviderContext";
import { useWebSocket } from "../providers/WebSocketContext";
import { Cpu, Zap, Activity, DollarSign, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function ProviderManagementConsole() {
  const {
    providers,
    providerMetrics,
    activeProvider,
    switchProvider,
    getProviderHealth
  } = useProvider();
  const { isConnected, connectionStatus, reconnect } = useWebSocket();

  const health = getProviderHealth();

  const getProviderStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'standby': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'inactive': return <AlertTriangle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProviderTypeColor = (type) => {
    return type === 'primary'
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
  };

  const formatLatency = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCost = (cost) => {
    return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(4)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-purple-500" />
          AI Provider Management
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'reconnecting' ? 'bg-yellow-500 animate-pulse' :
            connectionStatus === 'error' ? 'bg-red-500' :
            'bg-gray-500'
          }`} />
          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {connectionStatus}
          </span>
          {connectionStatus !== 'connected' && (
            <button
              onClick={reconnect}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              title="Reconnect WebSocket"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{health.primary.total}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Primary Providers</div>
          <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
            {health.primary.healthPercentage}% healthy
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{health.fallback.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Fallback Providers</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {health.fallback.healthPercentage}% healthy
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Object.values(providerMetrics).reduce((sum, m) => sum + m.successRate, 0) /
             Object.keys(providerMetrics).length || 0}%
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Avg Success Rate</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatLatency(Object.values(providerMetrics).reduce((sum, m) => sum + m.latency, 0) /
                         Object.keys(providerMetrics).length || 0)}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Avg Latency</div>
        </div>
      </div>

      {/* Active Provider Indicator */}
      <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-indigo-900 dark:text-indigo-100">Active Provider</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              {providers[activeProvider]?.name || 'None'} - {providers[activeProvider]?.purpose || ''}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getProviderStatusIcon(providers[activeProvider]?.status)}
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              {providers[activeProvider]?.status || 'unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(providers).map(([providerId, provider]) => {
          const metrics = providerMetrics[providerId] || {};
          const isActive = activeProvider === providerId;

          return (
            <div
              key={providerId}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => switchProvider(providerId)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getProviderStatusIcon(provider.status)}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {provider.name}
                  </span>
                  {isActive && <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded">Active</span>}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getProviderTypeColor(provider.type)}`}>
                  {provider.type}
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {provider.purpose}
              </p>

              {/* Models */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Models:</div>
                <div className="flex flex-wrap gap-1">
                  {provider.models.map(model => (
                    <span key={model} className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {model}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Latency:</span>
                  <span className="font-medium">{formatLatency(metrics.latency || 0)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Success:</span>
                  <span className="font-medium">{metrics.successRate || 0}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">Requests:</span>
                  <span className="font-medium">{metrics.totalRequests || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                  <span className="font-medium">{formatCost(metrics.costEstimate || 0)}</span>
                </div>
              </div>

              {metrics.lastUsed && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Last used: {new Date(metrics.lastUsed).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* RAG Memory Status */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
        <h3 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          RAG Memory System
        </h3>
        <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <div>• <strong>Vector Database:</strong> Active - Storing conversation history for retrieval</div>
          <div>• <strong>Memory Chunks:</strong> Auto-generated from Q&A pairs</div>
          <div>• <strong>Context Enhancement:</strong> Relevant past conversations injected into prompts</div>
          <div>• <strong>Continuous Learning:</strong> System builds knowledge base from all interactions</div>
        </div>
      </div>

      {/* Knowledge Graph Status */}
      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
        <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Knowledge Graph
        </h3>
        <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
          <div>• <strong>Entity Extraction:</strong> Functions, classes, files automatically identified</div>
          <div>• <strong>Relationship Mapping:</strong> Dynamic connections between concepts</div>
          <div>• <strong>Graph Traversal:</strong> Related entities retrieved for enhanced responses</div>
          <div>• <strong>Self-Learning:</strong> Graph grows with each conversation</div>
        </div>
      </div>

      {/* Multi-Provider Benchmark Status */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          <Cpu className="w-4 h-4 mr-2" />
          Multi-Provider Intelligence
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <div>• <strong>7 AI Providers:</strong> OpenRouter, Together, HuggingFace, Scaleway, NVIDIA NIM, Mistral, DeepSeek</div>
          <div>• <strong>Continuous Benchmarking:</strong> Performance testing every 5 minutes</div>
          <div>• <strong>Dynamic Selection:</strong> Best models automatically chosen per role</div>
          <div>• <strong>Cost Optimization:</strong> Intelligent routing based on latency and pricing</div>
        </div>
      </div>

      {/* Provider Strategy Info */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Provider Strategy</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>• <strong>Primary Providers:</strong> Mistral, DeepSeek, OpenRouter, NVIDIA NIM for optimal performance</div>
          <div>• <strong>Fallback Providers:</strong> Local HuggingFace and Ollama for offline/air-gapped environments</div>
          <div>• <strong>Auto-switching:</strong> Automatic failover based on health, latency, and cost metrics</div>
          <div>• <strong>Load balancing:</strong> Intelligent routing to balance load across healthy providers</div>
          <div>• <strong>Memory Integration:</strong> RAG and knowledge graph enhance all provider responses</div>
        </div>
      </div>
    </div>
  );
}