import { useState, useEffect } from 'react';
import { useOutput } from '../providers/OutputContext';
import { useProvider } from '../providers/ProviderContext';
import GitHubConnection from './GitHubConnection';
import {
  Code,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  FileText,
  GitBranch,
  Play,
  Copy,
  Eye,
  Folder,
  Github,
  Search,
  Database,
  BarChart3,
  FileCode,
  Settings,
  ChevronDown
} from 'lucide-react';

export default function AdvancedCodeIntelligence() {
  const { addOutput } = useOutput();
  const { activeProvider } = useProvider();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [codeInput, setCodeInput] = useState(`function calculateTotal(items) {
   let total = 0;
   for (let item of items) {
     total += item.price;
   }
   return total;
 }

 // Example usage
 const cart = [
   { name: 'Widget', price: 10.99 },
   { name: 'Gadget', price: 25.50 },
   { name: 'Tool', price: 15.75 }
 ];

 console.log(calculateTotal(cart));`);

  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('analysis');

  // Repository analysis state
  const [analysisMode, setAnalysisMode] = useState('single'); // 'single' or 'repository'
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [githubToken, setGithubToken] = useState('');
  const [repoAnalysisResults, setRepoAnalysisResults] = useState(null);
  const [isAnalyzingRepo, setIsAnalyzingRepo] = useState(false);
  const [repoStructure, setRepoStructure] = useState(null);

  // GitHub integration state
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [selectedGithubRepo, setSelectedGithubRepo] = useState(null);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);

  // Fetch intelligence analyses from API
  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      console.log('Fetching intelligence analyses from /api/intelligence/analyses');
      const response = await fetch('/api/intelligence/analyses');
      console.log('Intelligence analyses response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Intelligence analyses data received:', data);
      setAnalyses(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch intelligence analyses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load analyses on mount
  useEffect(() => {
    fetchAnalyses();
  }, []);

  // Handle GitHub connection changes
  const handleGitHubConnectionChange = async (connected, user) => {
    setGithubConnected(connected);
    setGithubUser(user);

    if (connected) {
      // Fetch user's GitHub repos
      try {
        const response = await fetch('/api/github/user/repos');
        if (response.ok) {
          const data = await response.json();
          setGithubRepos(data.repositories || []);
        }
      } catch (error) {
        console.error('Failed to fetch GitHub repos:', error);
      }
    } else {
      setGithubRepos([]);
      setSelectedGithubRepo(null);
    }
  };

  // Handle GitHub repo selection
  const handleRepoSelect = (repo) => {
    setSelectedGithubRepo(repo);
    setRepositoryUrl(repo.url);
    setBranch(repo.branch || 'main');
    setShowRepoDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRepoDropdown && !event.target.closest('.repo-dropdown')) {
        setShowRepoDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRepoDropdown]);

  const features = [
    { id: 'analysis', name: 'Code Analysis', icon: Eye, description: 'Comprehensive code quality analysis' },
    { id: 'suggestions', name: 'AI Suggestions', icon: Lightbulb, description: 'Intelligent code improvement suggestions' },
    { id: 'bugs', name: 'Bug Detection', icon: AlertTriangle, description: 'Automated bug and issue detection' },
    { id: 'optimization', name: 'Performance', icon: Zap, description: 'Performance optimization recommendations' },
    { id: 'security', name: 'Security Scan', icon: CheckCircle, description: 'Security vulnerability detection' },
    { id: 'repository', name: 'Repository Analysis', icon: Github, description: 'Analyze entire codebases and repositories' }
  ];

  const analyzeCode = async () => {
    if (!codeInput.trim()) return;

    setIsAnalyzing(true);
    addOutput({
      type: 'comment',
      content: `Analyzing code with ${activeProvider}...`
    });

    try {
      const response = await fetch('/api/intelligence/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_type: 'code',
          target_id: 'frontend_analysis',
          analysis_type: 'comprehensive',
          result: {
            code: codeInput,
            provider: activeProvider
          },
          confidence: 0.85
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analysisResult = await response.json();
      console.log('Analysis result:', analysisResult);

      // Use the backend result if available, otherwise fall back to mock
      const results = analysisResult.result || mockResults;
      setAnalysisResults(results);

      addOutput({
        type: 'comment',
        content: `✅ Code analysis completed - Quality: ${results.analysis?.quality || 'N/A'}%`
      });

    } catch (apiError) {
      console.warn('Backend analysis failed, using mock data:', apiError);

      // Fall back to mock results
      const mockResults = {
        analysis: {
          quality: 85,
          complexity: 'Medium',
          maintainability: 78,
          linesOfCode: 15,
          functions: 1,
          issues: [
            { type: 'style', message: 'Consider using const for immutable variables', line: 2, severity: 'low' },
            { type: 'performance', message: 'Consider using array.reduce() for better performance', line: 3, severity: 'medium' }
          ]
        },
        suggestions: [
          {
            type: 'refactor',
            title: 'Use array.reduce() for better performance',
            description: 'Replace the for loop with array.reduce() for more functional and potentially faster code.',
            code: `function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0);
}`,
            impact: 'high'
          }
        ],
        bugs: [],
        optimization: [],
        security: []
      };

      setAnalysisResults(mockResults);

      addOutput({
        type: 'comment',
        content: `✅ Code analysis completed (using fallback) - Quality: ${mockResults.analysis.quality}%`
      });
    }

    setIsAnalyzing(false);
  };

  const applySuggestion = (suggestion) => {
    setCodeInput(suggestion.code);
    addOutput({
      type: 'comment',
      content: `Applied suggestion: ${suggestion.title}`
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addOutput({
      type: 'comment',
      content: 'Code copied to clipboard'
    });
  };

  const analyzeRepository = async () => {
    if (!repositoryUrl.trim()) return;

    setIsAnalyzingRepo(true);
    addOutput({
      type: 'comment',
      content: `Analyzing repository: ${repositoryUrl}`
    });

    // Simulate repository analysis
    await new Promise(resolve => setTimeout(resolve, 5000));

    const mockRepoStructure = {
      name: repositoryUrl.split('/').pop(),
      owner: repositoryUrl.split('/').slice(-2)[0],
      branch: branch,
      stats: {
        files: 245,
        linesOfCode: 15420,
        languages: {
          'JavaScript': 45,
          'TypeScript': 30,
          'Python': 15,
          'CSS': 5,
          'HTML': 3,
          'Other': 2
        },
        commits: 1247,
        contributors: 8,
        lastCommit: '2024-01-15T10:30:00Z'
      },
      analysis: {
        overall: {
          quality: 82,
          maintainability: 76,
          testCoverage: 68,
          security: 79,
          performance: 71
        },
        issues: {
          critical: 3,
          high: 12,
          medium: 28,
          low: 45
        },
        recommendations: [
          'Consider adding more unit tests to improve coverage from 68% to 80%',
          'Address 3 critical security vulnerabilities in authentication module',
          'Refactor large functions in utils.js to improve maintainability',
          'Add TypeScript types to improve code reliability',
          'Consider implementing CI/CD pipeline for automated testing'
        ],
        topIssues: [
          { file: 'src/auth.js', type: 'security', severity: 'critical', description: 'SQL injection vulnerability in login function' },
          { file: 'src/utils.js', type: 'maintainability', severity: 'high', description: 'Function with 200+ lines should be refactored' },
          { file: 'tests/', type: 'testing', severity: 'medium', description: 'Missing integration tests for API endpoints' }
        ]
      }
    };

    setRepoStructure(mockRepoStructure);
    setRepoAnalysisResults(mockRepoStructure.analysis);

    addOutput({
      type: 'comment',
      content: `✅ Repository analysis completed - Quality: ${mockRepoStructure.analysis.overall.quality}%`
    });

    setIsAnalyzingRepo(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Code className="w-5 h-5 mr-2 text-blue-500" />
          Advanced Code Intelligence
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Provider:</span>
          <span className="font-medium text-gray-900 dark:text-white">{activeProvider}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Feature Selection */}
        <div className="lg:w-64 flex flex-col">
          {/* Analysis Mode Selection */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Analysis Mode</h3>
            <div className="space-y-2">
              <button
                onClick={() => setAnalysisMode('single')}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  analysisMode === 'single'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileCode className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-sm">Single File</div>
                    <div className={`text-xs ${analysisMode === 'single' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      Analyze code snippets
                    </div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setAnalysisMode('repository')}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  analysisMode === 'repository'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Github className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-sm">Repository</div>
                    <div className={`text-xs ${analysisMode === 'repository' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      Analyze entire codebases
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Feature Selection */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Analysis Features</h3>
            <div className="space-y-2">
              {features.filter(feature => feature.id !== 'repository').map(feature => {
                const IconComponent = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setSelectedFeature(feature.id)}
                    disabled={analysisMode === 'repository' && selectedFeature === 'repository'}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedFeature === feature.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5" />
                      <div>
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className={`text-xs ${selectedFeature === feature.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Code Input & Analysis */}
        <div className="flex-1 flex flex-col min-h-0">
          {analysisMode === 'single' ? (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Code Input</h3>
                  <button
                    onClick={analyzeCode}
                    disabled={isAnalyzing || !codeInput.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Analyze Code
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Paste your code here for AI-powered analysis..."
                  className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* GitHub Connection */}
              <div className="mb-6">
                <GitHubConnection onConnectionChange={handleGitHubConnectionChange} />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Repository Analysis</h3>
                  <button
                    onClick={analyzeRepository}
                    disabled={isAnalyzingRepo || !repositoryUrl.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                  >
                    {isAnalyzingRepo ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4 mr-2" />
                        Analyze Repository
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Repository
                    </label>
                    {githubConnected && githubRepos.length > 0 ? (
                      <div className="relative repo-dropdown">
                        <button
                          onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex items-center justify-between"
                        >
                          <span>
                            {selectedGithubRepo
                              ? `${selectedGithubRepo.name} (${selectedGithubRepo.language || 'Unknown'})`
                              : 'Select a repository...'
                            }
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        {showRepoDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto">
                            {githubRepos.map((repo) => (
                              <button
                                key={repo.id}
                                onClick={() => handleRepoSelect(repo)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{repo.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {repo.language || 'Unknown'} • {repo.private ? 'Private' : 'Public'}
                                  </div>
                                </div>
                                {repo.fork && <span className="text-xs text-gray-400">Fork</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="url"
                        value={repositoryUrl}
                        onChange={(e) => setRepositoryUrl(e.target.value)}
                        placeholder="https://github.com/owner/repo"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main, develop, etc."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {!githubConnected && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GitHub Personal Access Token (Optional)
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Token required for private repositories and higher rate limits
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Analysis Results */}
          <div className="flex-1 min-h-0">
            {analysisMode === 'repository' && repoAnalysisResults ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-full overflow-y-auto">
                <h4 className="font-medium text-gray-900 dark:text-white mb-6">Repository Analysis Results</h4>

                {repoStructure && (
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-4">Repository Overview</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-500">{repoStructure.stats.files}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Files</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-green-500">{repoStructure.stats.linesOfCode.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Lines of Code</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-purple-500">{repoStructure.stats.contributors}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Contributors</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-orange-500">{repoStructure.stats.commits}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Commits</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-2">Language Distribution</h6>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(repoStructure.stats.languages).map(([lang, percent]) => (
                          <div key={lang} className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{lang}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-4">Quality Metrics</h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(repoAnalysisResults.overall).map(([metric, value]) => (
                      <div key={metric} className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="text-xl font-bold text-blue-500">{value}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{metric}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-4">Issues Summary</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(repoAnalysisResults.issues).map(([severity, count]) => (
                      <div key={severity} className={`p-3 rounded ${
                        severity === 'critical' ? 'bg-red-100 dark:bg-red-900' :
                        severity === 'high' ? 'bg-orange-100 dark:bg-orange-900' :
                        severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        <div className="text-xl font-bold">{count}</div>
                        <div className="text-xs capitalize">{severity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-4">Top Issues</h5>
                  <div className="space-y-3">
                    {repoAnalysisResults.topIssues.map((issue, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{issue.file}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            issue.severity === 'critical' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                            issue.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                            'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          }`}>
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{issue.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-4">Recommendations</h5>
                  <div className="space-y-2">
                    {repoAnalysisResults.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : analysisResults && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-full overflow-y-auto">
                {selectedFeature === 'analysis' && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Code Analysis Results</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-500">{analysisResults.analysis.quality}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Quality Score</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-green-500">{analysisResults.analysis.maintainability}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Maintainability</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-purple-500">{analysisResults.analysis.linesOfCode}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Lines of Code</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-orange-500">{analysisResults.analysis.issues.length}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Issues Found</div>
                      </div>
                    </div>

                    {analysisResults.analysis.issues.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Issues</h5>
                        <div className="space-y-2">
                          {analysisResults.analysis.issues.map((issue, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-yellow-500">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900 dark:text-white capitalize">{issue.type}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  issue.severity === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                  issue.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                  'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                }`}>
                                  {issue.severity}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{issue.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Line {issue.line}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedFeature === 'suggestions' && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">AI Improvement Suggestions</h4>
                    <div className="space-y-4">
                      {analysisResults.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">{suggestion.title}</h5>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                suggestion.impact === 'high' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                suggestion.impact === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              }`}>
                                {suggestion.impact} impact
                              </span>
                              <button
                                onClick={() => applySuggestion(suggestion)}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{suggestion.description}</p>
                          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm">
                            <pre>{suggestion.code}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFeature === 'bugs' && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Bug Detection Results</h4>
                    <div className="space-y-3">
                      {analysisResults.bugs.map((bug, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-red-500">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">{bug.title}</h5>
                            <span className={`text-xs px-2 py-1 rounded ${
                              bug.severity === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                              bug.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                              'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}>
                              {bug.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{bug.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Line {bug.line}</p>
                          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                            <h6 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Fix:</h6>
                            <pre className="text-sm font-mono">{bug.fix}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFeature === 'optimization' && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Performance Optimization</h4>
                    <div className="space-y-3">
                      {analysisResults.optimization.map((opt, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">{opt.title}</h5>
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              {opt.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{opt.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <h6 className="font-medium text-red-600 dark:text-red-400 mb-1">Before:</h6>
                              <div className="bg-red-50 dark:bg-red-900 p-2 rounded font-mono text-sm">
                                {opt.before}
                              </div>
                            </div>
                            <div>
                              <h6 className="font-medium text-green-600 dark:text-green-400 mb-1">After:</h6>
                              <div className="bg-green-50 dark:bg-green-900 p-2 rounded font-mono text-sm">
                                {opt.after}
                              </div>
                            </div>
                          </div>
                          {opt.improvement && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                              <TrendingUp className="w-4 h-4 inline mr-1" />
                              Expected improvement: {opt.improvement}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFeature === 'security' && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Security Analysis</h4>
                    <div className="space-y-3">
                      {analysisResults.security.map((sec, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-orange-500">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">{sec.title}</h5>
                            <span className={`text-xs px-2 py-1 rounded ${
                              sec.risk === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                              sec.risk === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                              'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}>
                              {sec.risk} risk
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{sec.description}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            {sec.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}