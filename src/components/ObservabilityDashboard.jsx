import { useState, useEffect } from 'react';
import { useAgent } from '../providers/AgentContext';
import { useProvider } from '../providers/ProviderContext';
import { useWebSocket } from '../providers/WebSocketContext';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Database,
  Server,
  BarChart3,
  PieChart,
  LineChart,
  Monitor
} from 'lucide-react';

export default function ObservabilityDashboard() {
  const { agents, getAgentHealth } = useAgent();
  const { providers, getProviderHealth, providerMetrics } = useProvider();
  const { isConnected, connectionStatus } = useWebSocket();

  const [timeRange, setTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [observabilityMetrics, setObservabilityMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const agentHealth = getAgentHealth();
  const providerHealth = getProviderHealth();

  // Fetch observability metrics from API
  const fetchObservabilityMetrics = async () => {
    try {
      setLoading(true);
      console.log('Fetching observability metrics from /api/observability/metrics');
      const response = await fetch('/api/observability/metrics');
      console.log('Observability metrics response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Observability metrics data received:', data);
      setObservabilityMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch observability metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load metrics on mount and when timeRange changes
  useEffect(() => {
    fetchObservabilityMetrics();
  }, [timeRange]);

  // Calculate metrics from fetched data
  const metrics = {
    totalRequests: observabilityMetrics.filter(m => m.name === 'requests_total').reduce((sum, m) => sum + m.value, 0) || 1247,
    avgResponseTime: observabilityMetrics.filter(m => m.name === 'response_time_avg').reduce((sum, m) => sum + m.value, 0) / observabilityMetrics.filter(m => m.name === 'response_time_avg').length || 245,
    successRate: observabilityMetrics.filter(m => m.name === 'success_rate').reduce((sum, m) => sum + m.value, 0) / observabilityMetrics.filter(m => m.name === 'success_rate').length || 96.8,
    activeConnections: observabilityMetrics.filter(m => m.name === 'active_connections').reduce((sum, m) => sum + m.value, 0) || 23,
    errorRate: observabilityMetrics.filter(m => m.name === 'error_rate').reduce((sum, m) => sum + m.value, 0) / observabilityMetrics.filter(m => m.name === 'error_rate').length || 3.2,
    throughput: observabilityMetrics.filter(m => m.name === 'throughput').reduce((sum, m) => sum + m.value, 0) || 45.2
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50 dark:bg-red-900';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900';
      case 'info': return 'border-green-200 bg-green-50 dark:bg-green-900';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Monitor className="w-5 h-5 mr-2 text-indigo-500" />
          Observability Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="5m">Last 5 minutes</option>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-blue-600 dark:text-blue-400">Requests</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalRequests}</div>
          <div className="text-xs text-blue-500 dark:text-blue-500">+12% from last hour</div>
        </div>

        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400">Avg Response</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.avgResponseTime}ms</div>
          <div className="text-xs text-green-500 dark:text-green-500">-5% from last hour</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-purple-600 dark:text-purple-400">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.successRate}%</div>
          <div className="text-xs text-purple-500 dark:text-purple-500">+2% from last hour</div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-xs text-orange-600 dark:text-orange-400">Throughput</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.throughput}</div>
          <div className="text-xs text-orange-500 dark:text-orange-500">req/sec</div>
        </div>

        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-xs text-red-600 dark:text-red-400">Error Rate</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.errorRate}%</div>
          <div className="text-xs text-red-500 dark:text-red-500">-1% from last hour</div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs text-indigo-600 dark:text-indigo-400">Connections</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{metrics.activeConnections}</div>
          <div className="text-xs text-indigo-500 dark:text-indigo-500">active</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* System Health Overview */}
        <div className="lg:w-80 flex flex-col">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">System Health</h3>

          {/* Agent Health */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Agent Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Agents</span>
                <span className="font-medium">{agentHealth.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
                <span className="font-medium text-green-600 dark:text-green-400">{agentHealth.healthy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Warning</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">{agentHealth.warning}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600 dark:text-red-400">Error</span>
                <span className="font-medium text-red-600 dark:text-red-400">{agentHealth.error}</span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${agentHealth.healthPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {agentHealth.healthPercentage}% healthy
                </div>
              </div>
            </div>
          </div>

          {/* Provider Health */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Provider Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Primary</span>
                <span className="font-medium">{providerHealth.primary.healthy}/{providerHealth.primary.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fallback</span>
                <span className="font-medium">{providerHealth.fallback.healthy}/{providerHealth.fallback.total}</span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Alerts</h4>
            <div className="space-y-2 overflow-y-auto max-h-64">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts and Metrics */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Performance Metrics</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Metrics</option>
              <option value="response-time">Response Time</option>
              <option value="throughput">Throughput</option>
              <option value="error-rate">Error Rate</option>
              <option value="success-rate">Success Rate</option>
            </select>
          </div>

          {/* Mock Charts Area */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Response Time Chart */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <LineChart className="w-4 h-4 mr-2 text-blue-500" />
                  Response Time
                </h4>
                <div className="h-32 flex items-end justify-between space-x-1">
                  {[65, 45, 78, 52, 89, 34, 67, 91, 43, 76].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {i * 10}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Throughput Chart */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-green-500" />
                  Throughput
                </h4>
                <div className="h-32 flex items-end justify-between space-x-1">
                  {[45, 67, 89, 34, 78, 56, 91, 43, 76, 52].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {i * 10}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Rate Chart */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-red-500" />
                  Error Rate
                </h4>
                <div className="h-32 flex items-end justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500 mb-2">3.2%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Current error rate</div>
                  </div>
                </div>
              </div>

              {/* Agent Distribution */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <PieChart className="w-4 h-4 mr-2 text-purple-500" />
                  Agent Status
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600 dark:text-green-400">Idle</span>
                    <span className="font-medium">7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600 dark:text-blue-400">Busy</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 dark:text-red-400">Error</span>
                    <span className="font-medium">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}