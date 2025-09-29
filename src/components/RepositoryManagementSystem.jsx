import { useState, useEffect } from 'react';
import { useOutput } from '../providers/OutputContext';
import GitHubConnection from './GitHubConnection';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Folder,
  File,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  Code,
  AlertCircle,
  CheckCircle,
  Clock,
  Github
} from 'lucide-react';

export default function RepositoryManagementSystem() {
  const { addOutput } = useOutput();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoFiles, setRepoFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddRepo, setShowAddRepo] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState(null);
  const [newRepo, setNewRepo] = useState({
    name: '',
    url: '',
    description: '',
    branch: 'main'
  });

  // Fetch repositories from API
  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/repositories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const repos = await response.json();

      // If GitHub is connected, also fetch GitHub repos
      let allRepos = [...repos];
      if (githubConnected) {
        try {
          const githubResponse = await fetch('/api/github/user/repos');
          if (githubResponse.ok) {
            const githubData = await githubResponse.json();
            // Merge GitHub repos with existing repos, avoiding duplicates
            const existingUrls = new Set(repos.map(r => r.url));
            const githubRepos = githubData.repositories.filter(r => !existingUrls.has(r.url));
            allRepos = [...repos, ...githubRepos];
          }
        } catch (githubErr) {
          console.warn('Failed to fetch GitHub repos:', githubErr);
        }
      }

      setRepositories(allRepos);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch repositories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle GitHub connection changes
  const handleGitHubConnectionChange = (connected, user) => {
    setGithubConnected(connected);
    setGithubUser(user);
    // Refresh repositories when connection status changes
    fetchRepositories();
  };

  // Create new repository
  const createRepository = async () => {
    if (!newRepo.name || !newRepo.url) return;

    try {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRepo)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdRepo = await response.json();
      setRepositories(prev => [...prev, createdRepo]);
      setNewRepo({ name: '', url: '', description: '', branch: 'main' });
      setShowAddRepo(false);

      addOutput({
        type: 'comment',
        content: `✅ Repository ${createdRepo.name} created successfully`
      });
    } catch (err) {
      console.error('Failed to create repository:', err);
      addOutput({
        type: 'comment',
        content: `❌ Failed to create repository: ${err.message}`
      });
    }
  };

  // Load repositories on mount
  useEffect(() => {
    fetchRepositories();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'synced': return 'text-green-600 dark:text-green-400';
      case 'behind': return 'text-yellow-600 dark:text-yellow-400';
      case 'ahead': return 'text-blue-600 dark:text-blue-400';
      case 'conflict': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'synced': return <CheckCircle className="w-4 h-4" />;
      case 'behind': return <GitPullRequest className="w-4 h-4" />;
      case 'ahead': return <GitCommit className="w-4 h-4" />;
      case 'conflict': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const syncRepository = async (repoId) => {
    setIsLoading(true);
    const repo = repositories.find(r => r.id === repoId);

    addOutput({
      type: 'comment',
      content: `Syncing repository: ${repo.name}`
    });

    try {
      const response = await fetch(`/api/repositories/${repoId}/sync`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh repositories to get updated status
      await fetchRepositories();

      addOutput({
        type: 'comment',
        content: `✅ Repository ${repo.name} synced successfully`
      });
    } catch (err) {
      console.error('Failed to sync repository:', err);
      addOutput({
        type: 'comment',
        content: `❌ Failed to sync repository ${repo.name}: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPullRequest = async (repoId) => {
    const repo = repositories.find(r => r.id === repoId);
    addOutput({
      type: 'comment',
      content: `Creating pull request for ${repo.name}...`
    });

    try {
      const response = await fetch(`/api/repositories/${repoId}/pull-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Update ${repo.name}`,
          description: 'Automated pull request',
          number: Math.floor(Math.random() * 1000)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      addOutput({
        type: 'comment',
        content: `✅ ${result.message}`
      });
    } catch (err) {
      console.error('Failed to create pull request:', err);
      addOutput({
        type: 'comment',
        content: `❌ Failed to create pull request for ${repo.name}: ${err.message}`
      });
    }
  };

  const viewRepository = async (repo) => {
    setSelectedRepo(repo);
    setRepoFiles([]);

    try {
      const response = await fetch(`/api/repositories/${repo.id}/files`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const files = await response.json();
      setRepoFiles(files);
    } catch (err) {
      console.error('Failed to fetch repository files:', err);
      // Fallback to empty array
      setRepoFiles([]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <GitBranch className="w-5 h-5 mr-2 text-green-500" />
          Repository Management
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddRepo(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Repository
          </button>
          <button
            onClick={fetchRepositories}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* GitHub Connection */}
      <div className="mb-6">
        <GitHubConnection onConnectionChange={handleGitHubConnectionChange} />
      </div>

      {/* Add Repository Modal */}
      {showAddRepo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Repository</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newRepo.name}
                  onChange={(e) => setNewRepo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="repository-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={newRepo.url}
                  onChange={(e) => setNewRepo(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://github.com/user/repo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                <input
                  type="text"
                  value={newRepo.branch}
                  onChange={(e) => setNewRepo(prev => ({ ...prev, branch: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="main"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newRepo.description}
                  onChange={(e) => setNewRepo(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddRepo(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createRepository}
                disabled={!newRepo.name || !newRepo.url}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Repository
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Repository List */}
        <div className="lg:w-96 flex flex-col">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Repositories</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading repositories...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm text-red-400 mb-2">Failed to load repositories</p>
                <button
                  onClick={fetchRepositories}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Try again
                </button>
              </div>
            ) : repositories.length === 0 ? (
              <div className="text-center py-8">
                <GitBranch className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No repositories found</p>
              </div>
            ) : (
              repositories.map(repo => (
                <div
                  key={repo.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedRepo?.id === repo.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => viewRepository(repo)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {repo.name}
                    </span>
                    <div className={`flex items-center space-x-1 ${getStatusColor(repo.status)}`}>
                      {getStatusIcon(repo.status)}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {repo.description}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{repo.language}</span>
                    <span>{repo.size}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{repo.commits} commits</span>
                    <span>{repo.contributors} contributors</span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs ${getStatusColor(repo.status)}`}>
                      {repo.status}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          syncRepository(repo.id);
                        }}
                        disabled={isLoading}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        title="Sync repository"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          createPullRequest(repo.id);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        title="Create pull request"
                      >
                        <GitPullRequest className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Repository Details */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedRepo ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                  <Folder className="w-4 h-4 mr-2" />
                  {selectedRepo.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Branch: {selectedRepo.branch}
                  </span>
                  <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <Settings className="w-3 h-3 inline mr-1" />
                    Settings
                  </button>
                </div>
              </div>

              {/* Repository Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedRepo.commits}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Commits</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{selectedRepo.contributors}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Contributors</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{selectedRepo.size}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Size</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900 p-3 rounded-lg">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{selectedRepo.language}</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">Primary Language</div>
                </div>
              </div>

              {/* File Browser */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden min-h-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white">Files</h4>
                </div>
                <div className="overflow-y-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Size</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Modified</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repoFiles.map((file, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-2">
                              {file.type === 'folder' ? (
                                <Folder className="w-4 h-4 text-blue-500" />
                              ) : (
                                <File className="w-4 h-4 text-gray-500" />
                              )}
                              <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{file.size}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{file.modified}</td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end space-x-1">
                              <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition" title="View">
                                <Eye className="w-3 h-3" />
                              </button>
                              <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition" title="Edit">
                                <Code className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Repository</h3>
                <p className="text-sm">Choose a repository from the list to view its details and manage files.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}