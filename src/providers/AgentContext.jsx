import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AgentContext = createContext();

// Agent types based on B2.0 specification
const AGENT_TYPES = [
  'master_agent',
  'fix_implementation_agent',
  'debugger_agent',
  'review_agent',
  'deployment_agent',
  'monitoring_agent',
  'testing_agent',
  'security_agent',
  'performance_agent',
  'comparator_service',
  'feedback_agent'
];

export function AgentProvider({ children }) {
  const [agents, setAgents] = useState({});
  const [agentMetrics, setAgentMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Fetch agents from API
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching agents from /api/agents');
      const response = await fetch('/api/agents');
      console.log('Agent fetch response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const agentsData = await response.json();
      console.log('Agent data received:', agentsData);

      const agentsMap = {};
      agentsData.forEach(agent => {
        agentsMap[agent.id] = {
          ...agent,
          metrics: {
            tasksCompleted: 0,
            successRate: 100,
            averageResponseTime: 0,
            errorCount: 0
          }
        };
      });
      setAgents(agentsMap);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for agent status updates via HTTP
  const pollAgentStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/agents/status');
      if (response.ok) {
        const agentsData = await response.json();
        setAgents(prev => {
          const updated = { ...prev };
          agentsData.forEach(agent => {
            if (updated[agent.id]) {
              updated[agent.id] = {
                ...updated[agent.id],
                ...agent,
                lastActivity: new Date().toISOString()
              };
            }
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to poll agent status:', error);
    }
  }, []);

  // Load agents on mount and start polling
  useEffect(() => {
    fetchAgents();

    // Start polling for agent status updates every 10 seconds
    pollingIntervalRef.current = setInterval(pollAgentStatus, 10000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchAgents, pollAgentStatus]);

  const getAgentById = useCallback((agentId) => {
    return agents[agentId] || null;
  }, [agents]);

  const getAgentsByStatus = useCallback((status) => {
    return Object.values(agents).filter(agent => agent.status === status);
  }, [agents]);

  const getAgentHealth = useCallback(() => {
    const total = Object.keys(agents).length;
    const healthy = Object.values(agents).filter(agent => agent.health === 'healthy').length;
    const warning = Object.values(agents).filter(agent => agent.health === 'warning').length;
    const error = Object.values(agents).filter(agent => agent.health === 'error').length;

    return {
      total,
      healthy,
      warning,
      error,
      healthPercentage: total > 0 ? Math.round((healthy / total) * 100) : 0
    };
  }, [agents]);

  const value = {
    agents,
    agentMetrics,
    loading,
    error,
    getAgentById,
    getAgentsByStatus,
    getAgentHealth,
    agentTypes: Object.keys(agents)
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}