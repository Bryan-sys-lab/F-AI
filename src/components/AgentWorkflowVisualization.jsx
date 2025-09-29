import { useState, useEffect } from 'react';
import { useTask } from '../providers/TaskContext';
import { useAgent } from '../providers/AgentContext';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Cog,
  Shield,
  Database,
  GitBranch,
  Server,
  Eye,
  TestTube,
  Wrench,
  Brain
} from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: "User Request",
    description: "Task submitted to Orchestrator",
    agent: "user",
    icon: User,
    status: "pending"
  },
  {
    id: 2,
    title: "Planning",
    description: "Master Agent decomposes task",
    agent: "master_agent",
    icon: Brain,
    status: "pending"
  },
  {
    id: 3,
    title: "Task Assignment",
    description: "Subtasks assigned to agents",
    agent: "orchestrator",
    icon: Cog,
    status: "pending"
  },
  {
    id: 4,
    title: "Code Generation",
    description: "Fix Agent generates patches",
    agent: "fix_implementation_agent",
    icon: Wrench,
    status: "pending"
  },
  {
    id: 5,
    title: "Testing",
    description: "Testing Agent runs tests",
    agent: "testing_agent",
    icon: TestTube,
    status: "pending"
  },
  {
    id: 6,
    title: "Comparison",
    description: "Comparator ranks solutions",
    agent: "comparator_service",
    icon: GitBranch,
    status: "pending"
  },
  {
    id: 7,
    title: "Review",
    description: "Review Agent checks quality",
    agent: "review_agent",
    icon: Eye,
    status: "pending"
  },
  {
    id: 8,
    title: "Security Scan",
    description: "Security Agent scans code",
    agent: "security_agent",
    icon: Shield,
    status: "pending"
  },
  {
    id: 9,
    title: "Deployment",
    description: "Deploy Agent prepares release",
    agent: "deployment_agent",
    icon: Server,
    status: "pending"
  },
  {
    id: 10,
    title: "GitOps",
    description: "ArgoCD deploys to Kubernetes",
    agent: "gitops",
    icon: Database,
    status: "pending"
  },
  {
    id: 11,
    title: "Monitoring",
    description: "Monitoring Agent observes health",
    agent: "monitoring_agent",
    icon: AlertCircle,
    status: "pending"
  },
  {
    id: 12,
    title: "Feedback Loop",
    description: "Feedback Agent learns from results",
    agent: "feedback_agent",
    icon: Brain,
    status: "pending"
  },
  {
    id: 13,
    title: "Self-Improvement",
    description: "System optimizes based on data",
    agent: "system",
    icon: Cog,
    status: "pending"
  }
];

export default function AgentWorkflowVisualization() {
  const { taskStatus, progress, subTasks } = useTask();
  const { agents } = useAgent();
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowSteps, setWorkflowSteps] = useState(WORKFLOW_STEPS);

  // Update workflow steps based on subtasks
  useEffect(() => {
    if (subTasks.length > 0) {
      const steps = subTasks.map((subtask, index) => ({
        id: index + 1,
        title: subtask.agent || `Agent ${index + 1}`,
        description: subtask.description || `Processing ${subtask.agent}`,
        agent: subtask.agent,
        icon: Cog, // Default icon
        status: subtask.status === 'completed' ? 'completed' : subtask.status === 'running' ? 'active' : subtask.status === 'failed' ? 'error' : 'pending'
      }));
      setWorkflowSteps(steps);
    } else {
      setWorkflowSteps(WORKFLOW_STEPS);
    }
  }, [subTasks]);

  // Update current step based on subtasks or simulate
  useEffect(() => {
    if (subTasks.length > 0) {
      const completedCount = subTasks.filter(s => s.status === 'completed').length;
      const runningIndex = subTasks.findIndex(s => s.status === 'running');
      if (runningIndex !== -1) {
        setCurrentStep(runningIndex);
      } else if (completedCount === subTasks.length) {
        setCurrentStep(subTasks.length - 1);
      } else {
        setCurrentStep(completedCount);
      }
    } else {
      // Simulate workflow progress based on task status
      if (taskStatus === 'Running') {
        const interval = setInterval(() => {
          setCurrentStep(prev => {
            if (prev < workflowSteps.length - 1) {
              return prev + 1;
            }
            return prev;
          });
        }, 2000); // Advance every 2 seconds for demo

        return () => clearInterval(interval);
      } else if (taskStatus === 'Completed') {
        setCurrentStep(workflowSteps.length - 1);
      } else if (taskStatus === 'Idle') {
        setCurrentStep(0);
      }
    }
  }, [taskStatus, workflowSteps.length, subTasks]);

  // Update step statuses based on current step and agent health (only for default workflow)
  useEffect(() => {
    if (subTasks.length === 0) {
      setWorkflowSteps(prevSteps =>
        prevSteps.map((step, index) => {
          let status = 'pending';
          if (index < currentStep) {
            status = 'completed';
          } else if (index === currentStep && taskStatus === 'Running') {
            status = 'active';
          } else if (taskStatus === 'Failed' && index <= currentStep) {
            status = 'error';
          }

          // Check agent health for agent-specific steps
          if (step.agent && step.agent !== 'user' && step.agent !== 'orchestrator' && step.agent !== 'gitops' && step.agent !== 'system') {
            const agent = agents[step.agent];
            if (agent && agent.health === 'error') {
              status = 'error';
            }
          }

          return { ...step, status };
        })
      );
    }
  }, [currentStep, taskStatus, agents, subTasks.length]);

  const getStepStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-500';
      case 'active': return 'bg-blue-500 border-blue-500 animate-pulse';
      case 'error': return 'bg-red-500 border-red-500';
      default: return 'bg-gray-300 border-gray-300';
    }
  };

  const getStepStatusIcon = (status, IconComponent) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-white" />;
      case 'active': return <IconComponent className="w-5 h-5 text-white" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-white" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <GitBranch className="w-5 h-5 mr-2 text-blue-500" />
          B2.0 Workflow
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Progress:</span>
          <span className="font-medium text-gray-900 dark:text-white">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="relative">
        {/* Connection lines */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workflowSteps.map((step, index) => {
            const IconComponent = step.icon;
            const isLast = index === workflowSteps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Step Circle */}
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${getStepStatusColor(step.status)}`}>
                  {getStepStatusIcon(step.status, IconComponent)}
                </div>

                {/* Step Content */}
                <div className="text-center">
                  <h3 className={`font-medium text-sm mb-1 ${
                    step.status === 'active' ? 'text-blue-600 dark:text-blue-400' :
                    step.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    step.status === 'error' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {step.description}
                  </p>
                  {step.agent && (
                    <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {step.agent.replace(/_/g, ' ')}
                    </div>
                  )}
                </div>

                {/* Arrow to next step (except last) */}
                {!isLast && (
                  <ArrowRight className="w-4 h-4 text-gray-400 absolute -right-3 top-8 hidden xl:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Summary */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Workflow Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">
              Completed: {workflowSteps.filter(s => s.status === 'completed').length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">
              Active: {workflowSteps.filter(s => s.status === 'active').length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">
              Pending: {workflowSteps.filter(s => s.status === 'pending').length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-gray-600 dark:text-gray-400">
              Errors: {workflowSteps.filter(s => s.status === 'error').length}
            </span>
          </div>
        </div>
      </div>

      {/* Current Task Status */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Current Status: {taskStatus}
          </span>
          <div className="w-24 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}