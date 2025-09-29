import { useAgent } from "../providers/AgentContext";
import { useWebSocket } from "../providers/WebSocketContext";
import { Activity, CheckCircle, XCircle, AlertTriangle, Clock, Zap } from "lucide-react";

export default function AgentStatusDashboard() {
  const { agents, getAgentHealth, agentTypes } = useAgent();
  const { isConnected, connectionStatus, reconnect } = useWebSocket();
  const health = getAgentHealth();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'idle': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'busy': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAgentTypeColor = (agentType) => {
    const colors = {
      master_agent: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      fix_implementation_agent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      debugger_agent: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      review_agent: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      deployment_agent: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      monitoring_agent: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
      testing_agent: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
      security_agent: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      performance_agent: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
      comparator_service: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
      feedback_agent: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      task_classifier: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
    };
    return colors[agentType] || 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-500" />
          Agent Status Dashboard
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
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{health.total}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Agents</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{health.healthy}</div>
          <div className="text-sm text-green-600 dark:text-green-400">Healthy</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{health.warning}</div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Warning</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{health.error}</div>
          <div className="text-sm text-red-600 dark:text-red-400">Error</div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentTypes.map(agentType => {
          const agent = agents[agentType];
          if (!agent) return null;

          return (
            <div key={agentType} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(agent.status)}
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {agent.name}
                  </span>
                </div>
                {getHealthIcon(agent.health)}
              </div>

              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${getAgentTypeColor(agentType)}`}>
                {agentType.replace(/_/g, ' ')}
              </div>

              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize font-medium">{agent.status}</span>
                </div>
                {agent.currentTask && (
                  <div className="flex justify-between">
                    <span>Task:</span>
                    <span className="font-mono text-xs truncate max-w-24" title={agent.currentTask}>
                      {agent.currentTask}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tasks Done:</span>
                  <span>{agent.metrics.tasksCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span>{agent.metrics.successRate}%</span>
                </div>
                {agent.lastActivity && (
                  <div className="flex justify-between">
                    <span>Last Activity:</span>
                    <span>{new Date(agent.lastActivity).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Flow Indicator */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">B2.0 System Flow</h3>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>User Request → Task Classifier (AI Analysis)</span>
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Query Classification → Direct Response or Orchestration</span>
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Task Decomposition → Agent Assignment</span>
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Parallel Execution → Comparator Service</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Quality Gates → Deployment → Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}