import { useState, useEffect } from "react";
import { Github, CheckCircle, XCircle, Loader, ExternalLink, Key, X } from "lucide-react";

export default function GitHubConnection({ onConnectionChange, compact = false }) {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [personalAccessToken, setPersonalAccessToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/github/connection/status');
      const data = await response.json();

      setIsConnected(data.connected);
      setUser(data.user || null);
      if (onConnectionChange) {
        onConnectionChange(data.connected, data.user);
      }
    } catch (error) {
      console.error('Failed to check GitHub connection:', error);
      setIsConnected(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!personalAccessToken.trim()) {
      alert("Please enter your GitHub Personal Access Token");
      return;
    }

    setConnecting(true);
    try {
      const response = await fetch('/api/github/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personal_access_token: personalAccessToken.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsConnected(true);
        setUser(data.user);
        setPersonalAccessToken("");
        setShowTokenInput(false);
        if (onConnectionChange) {
          onConnectionChange(true, data.user);
        }
      } else {
        throw new Error(data.detail || 'Connection failed');
      }
    } catch (error) {
      console.error('GitHub connection failed:', error);
      alert(`Failed to connect to GitHub: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    // For now, we'll just clear the local state
    // In a full implementation, you'd call a backend endpoint to revoke the token
    setIsConnected(false);
    setUser(null);
    if (onConnectionChange) {
      onConnectionChange(false, null);
    }
  };

  if (compact) {
    // Compact version for header
    if (loading) {
      return (
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
          <Loader className="w-3 h-3 animate-spin text-gray-500" />
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-5 h-5 rounded-full"
              />
            )}
            <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
        ) : (
          <button
            onClick={() => setShowTokenInput(true)}
            disabled={connecting}
            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            title="Connect GitHub"
          >
            {connecting ? (
              <Loader className="w-3 h-3 animate-spin text-gray-500" />
            ) : (
              <Key className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}
      </div>
    );
  }

  // Full version for components
  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Loader className="w-5 h-5 animate-spin text-gray-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Checking GitHub connection...</span>
      </div>
    );
  }

  return (
    <>
      {/* Token Input Modal for compact mode */}
      {showTokenInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect GitHub</h3>
              <button
                onClick={() => {
                  setShowTokenInput(false);
                  setPersonalAccessToken("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={personalAccessToken}
                  onChange={(e) => setPersonalAccessToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Create a token at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">GitHub Settings → Personal access tokens</a>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Required scopes: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">repo</code>
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleConnect}
                  disabled={connecting || !personalAccessToken.trim()}
                  className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {connecting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowTokenInput(false);
                    setPersonalAccessToken("");
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Github className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">GitHub Connection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected
                ? `Connected as ${user?.login || 'user'}`
                : 'Connect your GitHub account to access repositories'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isConnected ? (
            <div className="flex items-center space-x-2">
              {user?.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
            </div>
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isConnected ? (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Disconnect
          </button>
        ) : (
          <>
            {!showTokenInput ? (
              <button
                onClick={() => setShowTokenInput(true)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>Enter Personal Access Token</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub Personal Access Token
                  </label>
                  <input
                    type="password"
                    value={personalAccessToken}
                    onChange={(e) => setPersonalAccessToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Create a token at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">GitHub Settings → Developer settings → Personal access tokens</a>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Required scopes: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">repo</code> (full control of private repositories)
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleConnect}
                    disabled={connecting || !personalAccessToken.trim()}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {connecting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowTokenInput(false);
                      setPersonalAccessToken("");
                    }}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {isConnected && (
          <a
            href={`https://github.com/${user?.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium flex items-center space-x-1"
          >
            <span>View Profile</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {isConnected && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ GitHub connected! You can now browse and analyze your repositories.
          </p>
        </div>
      )}
    </div>
  </>
  );
}