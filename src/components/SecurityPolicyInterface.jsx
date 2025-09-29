import { useState, useEffect } from 'react';
import { useOutput } from '../providers/OutputContext';
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

export default function SecurityPolicyInterface() {
  const { addOutput } = useOutput();
  const [policies, setPolicies] = useState([]);
  const [scans, setScans] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch security policies from API
  const fetchSecurityPolicies = async () => {
    try {
      setLoading(true);
      console.log('Fetching security policies from /api/security/policies');
      const response = await fetch('/api/security/policies');
      console.log('Security policies response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Security policies data received:', data);
      setPolicies(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch security policies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch security scans from API
  const fetchSecurityScans = async () => {
    try {
      console.log('Fetching security scans from /api/security/scans');
      const response = await fetch('/api/security/scans');
      console.log('Security scans response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Security scans data received:', data);
      setScans(data);
    } catch (err) {
      console.error('Failed to fetch security scans:', err);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchSecurityPolicies();
    fetchSecurityScans();
  }, []);

  const getStatusColor = (enabled) => {
    return enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400';
  };

  const getStatusIcon = (enabled) => {
    return enabled ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  const togglePolicyStatus = async (policyId) => {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;

    const newStatus = policy.enabled ? false : true;

    try {
      // Update policy status via API
      const response = await fetch(`/api/security/policies/${policyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: newStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setPolicies(prev => prev.map(p =>
        p.id === policyId ? { ...p, enabled: newStatus } : p
      ));

      addOutput({
        type: 'comment',
        content: `Policy ${policyId} ${newStatus ? 'enabled' : 'disabled'}`
      });
    } catch (err) {
      console.error('Failed to update policy status:', err);
      addOutput({
        type: 'comment',
        content: `Failed to update policy ${policyId}: ${err.message}`
      });
    }
  };

  const resolveViolation = (violationId) => {
    setViolations(prev => prev.map(v =>
      v.id === violationId ? { ...v, resolved: true } : v
    ));

    addOutput({
      type: 'comment',
      content: `Security violation ${violationId} marked as resolved`
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-red-500" />
          Security Policy Interface
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              fetchSecurityPolicies();
              fetchSecurityScans();
            }}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Policy
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Policies List */}
        <div className="lg:w-96 flex flex-col">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Security Policies</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {policies.map(policy => (
              <div
                key={policy.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPolicy?.id === policy.id
                    ? 'border-red-500 bg-red-50 dark:bg-red-900'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => setSelectedPolicy(policy)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {policy.name}
                  </span>
                  <div className={`flex items-center space-x-1 ${getStatusColor(policy.enabled)}`}>
                    {getStatusIcon(policy.enabled)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {policy.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{policy.category}</span>
                  <span>{policy.rules.length} rules</span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs px-2 py-1 rounded ${policy.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                    {policy.status}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePolicyStatus(policy.id);
                      }}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      title={policy.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {policy.status === 'active' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Details & Violations */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedPolicy ? (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Policy Details</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{selectedPolicy.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedPolicy.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Category</span>
                      <div className="font-medium text-gray-900 dark:text-white">{selectedPolicy.category}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                      <div className={`font-medium ${getStatusColor(selectedPolicy.enabled)}`}>
                        {selectedPolicy.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Rules</span>
                      <div className="font-medium text-gray-900 dark:text-white">{selectedPolicy.rules.length}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Last Modified</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedPolicy.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Rules</h5>
                    <div className="space-y-2">
                      {selectedPolicy.rules.map((rule, index) => (
                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{rule.type}:</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{rule.value}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            rule.action === 'block' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                            rule.action === 'require_review' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                            'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}>
                            {rule.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Security Scans</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {scans.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No security scans found
                      </div>
                    ) : (
                      scans.map(scan => (
                        <div
                          key={scan.id}
                          className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className={`w-4 h-4 ${
                                scan.score > 7 ? 'text-red-500' :
                                scan.score > 4 ? 'text-yellow-500' : 'text-green-500'
                              }`} />
                              <span className={`text-sm font-medium px-2 py-1 rounded ${
                                scan.score > 7 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                scan.score > 4 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              }`}>
                                Score: {scan.score}/10
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                scan.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                scan.status === 'running' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              }`}>
                                {scan.status}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(scan.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white mb-2">
                            Target: {scan.target_type} - {scan.target_id}
                          </p>
                          {scan.findings && Object.keys(scan.findings).length > 0 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Findings: {Object.keys(scan.findings).length} issues detected
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Security Policy</h3>
                <p className="text-sm">Choose a policy from the list to view its details and manage violations.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}