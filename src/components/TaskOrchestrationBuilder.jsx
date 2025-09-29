import { useState, useRef } from 'react';
import { useTask } from '../providers/TaskContext';
import { useOutput } from '../providers/OutputContext';
import { useAgent } from '../providers/AgentContext';
import {
  Plus,
  Trash2,
  Play,
  Save,
  GitBranch,
  ArrowRight,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function TaskOrchestrationBuilder() {
  const { startTask, completeTask, failTask } = useTask();
  const { addOutput } = useOutput();
  const { agents, agentTypes } = useAgent();

  const [workflowName, setWorkflowName] = useState('');
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Code Analysis',
      agent: 'review_agent',
      dependencies: [],
      status: 'pending',
      config: { priority: 'high', timeout: 300 }
    }
  ]);
  const [connections, setConnections] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);

  const nextTaskId = useRef(2);

  const addTask = () => {
    const newTask = {
      id: nextTaskId.current,
      name: `Task ${nextTaskId.current}`,
      agent: agentTypes[0],
      dependencies: [],
      status: 'pending',
      config: { priority: 'medium', timeout: 300 }
    };
    setTasks(prev => [...prev, newTask]);
    nextTaskId.current++;
  };

  const removeTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setConnections(prev => prev.filter(conn => conn.from !== taskId && conn.to !== taskId));
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const addConnection = (fromId, toId) => {
    // Prevent circular dependencies and duplicate connections
    if (fromId === toId) return;
    if (connections.some(conn => conn.from === fromId && conn.to === toId)) return;

    // Check for circular dependency
    if (wouldCreateCycle(fromId, toId)) return;

    setConnections(prev => [...prev, { from: fromId, to: toId }]);
    // Update task dependencies
    setTasks(prev => prev.map(task =>
      task.id === toId
        ? { ...task, dependencies: [...task.dependencies, fromId] }
        : task
    ));
  };

  const wouldCreateCycle = (fromId, toId) => {
    const visited = new Set();
    const stack = [toId];

    while (stack.length > 0) {
      const current = stack.pop();
      if (visited.has(current)) continue;
      visited.add(current);

      if (current === fromId) return true;

      const outgoingConnections = connections.filter(conn => conn.from === current);
      stack.push(...outgoingConnections.map(conn => conn.to));
    }

    return false;
  };

  const runWorkflow = async () => {
    if (tasks.length === 0) return;

    setIsRunning(true);
    startTask();
    setExecutionLog([]);

    const log = (message, type = 'info') => {
      setExecutionLog(prev => [...prev, {
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toISOString()
      }]);
    };

    log(`Starting workflow: ${workflowName || 'Unnamed Workflow'}`);

    try {
      // Simple topological sort for execution order
      const executionOrder = getExecutionOrder();

      for (const taskId of executionOrder) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) continue;

        log(`Executing: ${task.name} (${task.agent})`);
        updateTask(taskId, { status: 'running' });

        // Simulate task execution
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Random success/failure for demo
        const success = Math.random() > 0.2;
        if (success) {
          updateTask(taskId, { status: 'completed' });
          log(`✅ ${task.name} completed successfully`);
        } else {
          updateTask(taskId, { status: 'failed' });
          log(`❌ ${task.name} failed`);
          throw new Error(`${task.name} failed`);
        }
      }

      log('Workflow completed successfully!');
      completeTask();
      addOutput({
        type: 'comment',
        content: `Workflow "${workflowName || 'Unnamed'}" completed successfully`
      });

    } catch (error) {
      log(`Workflow failed: ${error.message}`);
      failTask();
      addOutput({
        type: 'comment',
        content: `Workflow "${workflowName || 'Unnamed'}" failed: ${error.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getExecutionOrder = () => {
    const order = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (taskId) => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) throw new Error('Circular dependency detected');

      visiting.add(taskId);

      const task = tasks.find(t => t.id === taskId);
      if (task) {
        for (const depId of task.dependencies) {
          visit(depId);
        }
      }

      visiting.delete(taskId);
      visited.add(taskId);
      order.push(taskId);
    };

    // Visit all tasks
    for (const task of tasks) {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    }

    return order;
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900 border-green-500';
      case 'running': return 'bg-blue-100 dark:bg-blue-900 border-blue-500';
      case 'failed': return 'bg-red-100 dark:bg-red-900 border-red-500';
      default: return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <GitBranch className="w-5 h-5 mr-2 text-orange-500" />
          Task Orchestration Builder
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={addTask}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
          <button
            onClick={runWorkflow}
            disabled={isRunning || tasks.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Workflow
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Workflow Canvas */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="mb-4">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow name..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Tasks Canvas */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 overflow-auto min-h-0 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 transition-all ${getTaskStatusColor(task.status)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTaskStatusIcon(task.status)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {task.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <select
                      value={task.agent}
                      onChange={(e) => updateTask(task.id, { agent: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {agentTypes.map(agentType => (
                        <option key={agentType} value={agentType}>
                          {agentType.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>

                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Dependencies: {task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {tasks.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No tasks in workflow</p>
                <p className="text-sm">Click "Add Task" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Execution Log */}
        <div className="lg:w-80 flex flex-col">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Execution Log</h3>
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-y-auto min-h-0">
            {executionLog.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No execution log yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {executionLog.map(log => (
                  <div
                    key={log.id}
                    className={`p-2 rounded text-sm ${
                      log.type === 'error'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div>{log.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}