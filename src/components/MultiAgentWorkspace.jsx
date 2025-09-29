import { useState } from 'react';
import { useAgent } from '../providers/AgentContext';
import { useTask } from '../providers/TaskContext';
import { useOutput } from '../providers/OutputContext';
import {
  Users,
  MessageSquare,
  Send,
  Settings,
  Play,
  Pause,
  Square,
  Eye,
  EyeOff
} from 'lucide-react';

export default function MultiAgentWorkspace() {
  const { agents, agentTypes } = useAgent();
  const { taskStatus, startTask, completeTask, failTask } = useTask();
  const { addOutput } = useOutput();
  const [selectedAgents, setSelectedAgents] = useState(new Set(['master_agent', 'fix_implementation_agent']));
  const [workspaceMessages, setWorkspaceMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);
  const [showAgentDetails, setShowAgentDetails] = useState(true);

  const toggleAgentSelection = (agentId) => {
    const newSelection = new Set(selectedAgents);
    if (newSelection.has(agentId)) {
      newSelection.delete(agentId);
    } else {
      newSelection.add(agentId);
    }
    setSelectedAgents(newSelection);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    setWorkspaceMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate agent responses
    setTimeout(() => {
      const responses = Array.from(selectedAgents).map(agentId => ({
        id: Date.now() + Math.random(),
        content: `Agent ${agentId.replace(/_/g, ' ')} acknowledges: "${newMessage}"`,
        sender: agentId,
        timestamp: new Date().toISOString(),
        type: 'response'
      }));

      setWorkspaceMessages(prev => [...prev, ...responses]);
    }, 1000);
  };

  const startWorkspace = () => {
    setIsWorkspaceActive(true);
    startTask();
    addOutput({
      type: 'comment',
      content: `Multi-agent workspace activated with ${selectedAgents.size} agents`
    });
  };

  const stopWorkspace = () => {
    setIsWorkspaceActive(false);
    completeTask();
    addOutput({
      type: 'comment',
      content: 'Multi-agent workspace deactivated'
    });
  };

  const getAgentStatusColor = (agentId) => {
    const agent = agents[agentId];
    if (!agent) return 'bg-gray-100 dark:bg-gray-700';

    switch (agent.status) {
      case 'idle': return 'bg-green-100 dark:bg-green-900';
      case 'busy': return 'bg-blue-100 dark:bg-blue-900';
      case 'error': return 'bg-red-100 dark:bg-red-900';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-500" />
          Multi-Agent Workspace
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAgentDetails(!showAgentDetails)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title={showAgentDetails ? 'Hide agent details' : 'Show agent details'}
          >
            {showAgentDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {!isWorkspaceActive ? (
            <button
              onClick={startWorkspace}
              disabled={selectedAgents.size === 0}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Workspace
            </button>
          ) : (
            <button
              onClick={stopWorkspace}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Workspace
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Agent Selection Panel */}
        <div className="lg:w-80 flex flex-col">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Active Agents</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {agentTypes.map(agentType => {
              const agent = agents[agentType];
              const isSelected = selectedAgents.has(agentType);

              return (
                <div
                  key={agentType}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => toggleAgentSelection(agentType)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {agent?.name || agentType.replace(/_/g, ' ')}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${getAgentStatusColor(agentType)}`} />
                  </div>

                  {showAgentDetails && agent && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Status: <span className="capitalize font-medium">{agent.status}</span></div>
                      <div>Tasks: {agent.metrics.tasksCompleted}</div>
                      <div>Success: {agent.metrics.successRate}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Communication Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Agent Communication
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {workspaceMessages.length} messages
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-y-auto mb-4 min-h-0">
            {workspaceMessages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the workspace and send a message to begin collaboration.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workspaceMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {message.sender === 'user' ? 'You' : message.sender.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-50 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Send message to selected agents..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!isWorkspaceActive}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isWorkspaceActive}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Status */}
      {isWorkspaceActive && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Workspace Active - {selectedAgents.size} agents participating
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 dark:text-green-300">Live</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}