import { useState, useEffect } from 'react';
import { useOutput } from '../providers/OutputContext';
import {
  Github,
  Gitlab,
  Zap,
  Database,
  MessageSquare,
  Monitor,
  CheckCircle,
  XCircle,
  Settings,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  LogIn,
  LogOut,
  User
} from 'lucide-react';

export default function IntegrationEcosystemConnectors() {
  const { addOutput } = useOutput();

  const [githubUser, setGithubUser] = useState(null);
  const [githubToken, setGithubToken] = useState('');
  const [isGithubAuthenticating, setIsGithubAuthenticating] = useState(false);

  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionLogs, setConnectionLogs] = useState([]);

  // Fetch integrations from API
  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      console.log('Fetching integrations from /api/integrations');
      const response = await fetch('/api/integrations');
      console.log('Integrations response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Integrations data received:', data);

      // Add icons and features to the data
      const iconMap = {
        github: Github,
        gitlab: Gitlab,
        slack: MessageSquare,
        datadog: Monitor,
        prometheus: Database
      };

      const enhancedData = data.map(integration => ({
        ...integration,
        icon: iconMap[integration.type] || Settings,
        features: getIntegrationFeatures(integration.type)
      }));

      setIntegrations(enhancedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get features for integration types
  const getIntegrationFeatures = (type) => {
    const featureMap = {
      github: ['PR Webhooks', 'Issue Sync', 'Branch Protection', 'Code Review'],
      gitlab: ['Pipeline Triggers', 'MR Automation', 'Security Scanning'],
      jenkins: ['Build Triggers', 'Test Results', 'Artifact Storage'],
      slack: ['Build Notifications', 'Error Alerts', 'Daily Reports'],
      datadog: ['Metrics Collection', 'Log Aggregation', 'Alert Management'],
      prometheus: ['Custom Metrics', 'Service Discovery', 'Alert Rules']
    };
    return featureMap[type] || ['Basic Integration'];
  };

  // Load integrations on mount
  useEffect(() => {
    fetchIntegrations();
  }, []);

  // Check for stored GitHub token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    const storedUser = localStorage.getItem('github_user');

    if (storedToken) {
      setGithubToken(storedToken);
      if (storedUser) {
        setGithubUser(JSON.parse(storedUser));
      }
      // Update GitHub integration status
      setIntegrations(prev => prev.map(i =>
        i.id === 'github' ? { ...i, status: 'connected', config: { token: storedToken } } : i
      ));
    }
  }, []);

  const authenticateWithGithub = async () => {
    setIsGithubAuthenticating(true);

    try {
      // Check if we already have stored credentials
      const storedToken = localStorage.getItem('github_token');
      const storedUser = localStorage.getItem('github_user');

      if (storedToken && storedUser) {
        // Use stored credentials
        setGithubToken(storedToken);
        setGithubUser(JSON.parse(storedUser));

        // Update integration status
        setIntegrations(prev => prev.map(i =>
          i.id === 'github' ? {
            ...i,
            status: 'connected',
            config: { token: storedToken },
            lastSync: new Date().toISOString()
          } : i
        ));

        addOutput({
          type: 'comment',
          content: `✅ Using stored GitHub authentication`
        });
      } else {
        // In a real implementation, this would redirect to GitHub OAuth
        // For now, we'll show a message about OAuth setup needed
        addOutput({
          type: 'comment',
          content: `⚠️ GitHub OAuth not configured. Please set up GitHub OAuth in the backend to enable authentication.`
        });

        // For demo purposes, create a placeholder entry
        const placeholderUser = {
          login: 'oauth_required',
          name: 'GitHub OAuth Required',
          avatar_url: 'https://github.com/images/error/octocat_happy.gif',
          public_repos: 0,
          followers: 0
        };

        setGithubUser(placeholderUser);

        // Add to logs
        setConnectionLogs(prev => [{
          id: Date.now(),
          integration: 'github',
          message: 'GitHub OAuth authentication required',
          type: 'warning',
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
      }

    } catch (error) {
      console.error('GitHub authentication error:', error);
      addOutput({
        type: 'comment',
        content: `❌ GitHub authentication failed: ${error.message}`
      });
    } finally {
      setIsGithubAuthenticating(false);
    }
  };

  const logoutFromGithub = () => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');

    setGithubToken('');
    setGithubUser(null);

    // Update integration status
    setIntegrations(prev => prev.map(i =>
      i.id === 'github' ? {
        ...i,
        status: 'disconnected',
        config: {},
        lastSync: null
      } : i
    ));

    setConnectionLogs(prev => [{
      id: Date.now(),
      integration: 'github',
      message: 'Logged out from GitHub',
      type: 'info',
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 9)]);

    addOutput({
      type: 'comment',
      content: 'Logged out from GitHub'
    });
  };

  const getStatusColor = (status) => {
    return status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400';
  };

  const getStatusIcon = (status) => {
    return status === 'connected' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const toggleConnection = async (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';

    // Simulate connection process
    addOutput({
      type: 'comment',
      content: `${newStatus === 'connected' ? 'Connecting to' : 'Disconnecting from'} ${integration.name}...`
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    setIntegrations(prev => prev.map(i =>
      i.id === integrationId
        ? { ...i, status: newStatus, lastSync: newStatus === 'connected' ? new Date().toISOString() : null }
        : i
    ));

    // Add to logs
    setConnectionLogs(prev => [{
      id: Date.now(),
      integration: integrationId,
      message: `${integration.name} ${newStatus === 'connected' ? 'connected successfully' : 'disconnected'}`,
      type: newStatus === 'connected' ? 'success' : 'info',
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 9)]);

    addOutput({
      type: 'comment',
      content: `✅ ${integration.name} ${newStatus === 'connected' ? 'connected' : 'disconnected'}`
    });
  };

  const testConnection = async (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);

    addOutput({
      type: 'comment',
      content: `Testing connection to ${integration.name}...`
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = Math.random() > 0.2; // 80% success rate for demo

    setConnectionLogs(prev => [{
      id: Date.now(),
      integration: integrationId,
      message: `Connection test ${success ? 'successful' : 'failed'}`,
      type: success ? 'success' : 'error',
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 9)]);

    addOutput({
      type: 'comment',
      content: `Connection test ${success ? 'passed' : 'failed'} for ${integration.name}`
    });
  };

  const syncIntegration = async (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);

    addOutput({
      type: 'comment',
      content: `Syncing ${integration.name}...`
    });

    try {
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh integrations to get updated data
      await fetchIntegrations();

      setConnectionLogs(prev => [{
        id: Date.now(),
        integration: integrationId,
        message: `Sync completed for ${integration.name}`,
        type: 'success',
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);

      addOutput({
        type: 'comment',
        content: `✅ ${integration.name} synced successfully`
      });
    } catch (err) {
      console.error('Failed to sync integration:', err);
      setConnectionLogs(prev => [{
        id: Date.now(),
        integration: integrationId,
        message: `Sync failed for ${integration.name}: ${err.message}`,
        type: 'error',
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);

      addOutput({
        type: 'comment',
        content: `❌ Failed to sync ${integration.name}: ${err.message}`
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          Integration Ecosystem
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchIntegrations}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {/* GitHub Authentication Status */}
          {githubUser ? (
            <div className="flex items-center space-x-3 bg-green-50 dark:bg-green-900 px-3 py-2 rounded-lg">
              <img
                src={githubUser.avatar_url}
                alt={githubUser.login}
                className="w-8 h-8 rounded-full"
              />
              <div className="text-sm">
                <div className="font-medium text-green-900 dark:text-green-100">{githubUser.name}</div>
                <div className="text-green-700 dark:text-green-300">@{githubUser.login}</div>
              </div>
              <button
                onClick={logoutFromGithub}
                className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded"
                title="Logout from GitHub"
              >
                <LogOut className="w-4 h-4 text-green-700 dark:text-green-300" />
              </button>
            </div>
          ) : (
            <button
              onClick={authenticateWithGithub}
              disabled={isGithubAuthenticating}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {isGithubAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  <span>Connect GitHub</span>
                </>
              )}
            </button>
          )}

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {integrations.filter(i => i.status === 'connected').length} of {integrations.length} connected
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Integrations Grid */}
        <div className="lg:w-96 flex flex-col">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Available Integrations</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {integrations.map(integration => {
              const IconComponent = integration.icon || Settings;
              return (
                <div
                  key={integration.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedIntegration?.id === integration.id
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {integration.name}
                      </span>
                    </div>
                    <div className={`flex items-center space-x-1 ${getStatusColor(integration.status)}`}>
                      {getStatusIcon(integration.status)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {integration.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {integration.features.slice(0, 2).map(feature => (
                      <span key={feature} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                    {integration.features.length > 2 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                        +{integration.features.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          testConnection(integration.id);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        title="Test connection"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      {integration.status === 'connected' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            syncIntegration(integration.id);
                          }}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                          title="Sync data"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleConnection(integration.id);
                        }}
                        className={`p-1 rounded transition ${
                          integration.status === 'connected'
                            ? 'hover:bg-red-100 dark:hover:bg-red-900 text-red-500'
                            : 'hover:bg-green-100 dark:hover:bg-green-900 text-green-500'
                        }`}
                        title={integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      >
                        {integration.status === 'connected' ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {integration.lastSync && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Details & Logs */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedIntegration ? (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Integration Details</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">{selectedIntegration.name}</h4>
                    <div className={`flex items-center space-x-1 ${getStatusColor(selectedIntegration.status)}`}>
                      {getStatusIcon(selectedIntegration.status)}
                      <span className="text-sm capitalize">{selectedIntegration.status}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {selectedIntegration.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Features</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedIntegration.features.map(feature => (
                          <span key={feature} className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Configuration</h5>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {Object.entries(selectedIntegration.config).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-mono">
                              {typeof value === 'string' && value.length > 10
                                ? `${value.substring(0, 10)}...`
                                : String(value)
                              }
                            </span>
                          </div>
                        ))}
                        {Object.keys(selectedIntegration.config).length === 0 && (
                          <span className="text-gray-500">Not configured</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => testConnection(selectedIntegration.id)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                    >
                      Test Connection
                    </button>
                    <button
                      onClick={() => setIsConfiguring(true)}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition"
                    >
                      Configure
                    </button>
                    <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                      <ExternalLink className="w-3 h-3 inline mr-1" />
                      Docs
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Connection Logs</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden h-64">
                  <div className="overflow-y-auto max-h-full p-4 space-y-3">
                    {connectionLogs.filter(log => log.integration === selectedIntegration.id).map(log => (
                      <div key={log.id} className="flex items-start space-x-3">
                        <div className={`mt-0.5 ${getLogTypeColor(log.type)}`}>
                          {log.type === 'success' && <CheckCircle className="w-4 h-4" />}
                          {log.type === 'error' && <XCircle className="w-4 h-4" />}
                          {log.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                          {log.type === 'info' && <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {connectionLogs.filter(log => log.integration === selectedIntegration.id).length === 0 && (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No logs available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select an Integration</h3>
                <p className="text-sm">Choose an integration from the list to view its details and manage connections.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {isConfiguring && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              Configure {selectedIntegration.name}
            </h3>
            <div className="space-y-4">
              {Object.entries(selectedIntegration.config).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type={key.includes('token') || key.includes('key') ? 'password' : 'text'}
                    defaultValue={value}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`Enter ${key}`}
                  />
                </div>
              ))}
              {Object.keys(selectedIntegration.config).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No configuration options available for this integration.
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsConfiguring(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsConfiguring(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}