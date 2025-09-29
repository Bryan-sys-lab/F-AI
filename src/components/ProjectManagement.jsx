import { useState, useEffect } from 'react';
import { useOutput } from '../providers/OutputContext';
import {
  Folder,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  GitBranch,
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react';

export default function ProjectManagement() {
  const { addOutput } = useOutput();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching projects from /api/projects');
      const response = await fetch('/api/projects');
      console.log('Projects response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Projects data received:', data);
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new project
  const createProject = async () => {
    if (!newProject.name.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProject)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdProject = await response.json();
      setProjects(prev => [...prev, createdProject]);
      setNewProject({ name: '', description: '' });
      setShowCreateForm(false);

      addOutput({
        type: 'comment',
        content: `✅ Project ${createdProject.name} created successfully`
      });
    } catch (err) {
      console.error('Failed to create project:', err);
      addOutput({
        type: 'comment',
        content: `❌ Failed to create project: ${err.message}`
      });
    }
  };

  // Fetch tasks for selected project
  const fetchProjectTasks = async (projectId) => {
    try {
      console.log(`Fetching tasks for project ${projectId}`);
      const response = await fetch(`/api/tasks?project_id=${projectId}`);
      console.log('Project tasks response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Project tasks data received:', data);
      setProjectTasks(data);
    } catch (err) {
      console.error('Failed to fetch project tasks:', err);
      setProjectTasks([]);
    }
  };

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Load tasks when project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchProjectTasks(selectedProject.id);
    } else {
      setProjectTasks([]);
    }
  }, [selectedProject]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'completed': return 'text-blue-600 dark:text-blue-400';
      case 'paused': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'in_progress': return 'text-blue-600 dark:text-blue-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Folder className="w-5 h-5 mr-2 text-blue-500" />
          Project Management
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </button>
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProject.name.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Projects List */}
        <div className="lg:w-96 flex flex-col">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Projects</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm text-red-400 mb-2">Failed to load projects</p>
                <button
                  onClick={fetchProjects}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Try again
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No projects found</p>
              </div>
            ) : (
              projects.map(project => (
                <div
                  key={project.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedProject?.id === project.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </span>
                    <div className={`flex items-center space-x-1 ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{project.task_count || 0} tasks</span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedProject ? (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Project Details</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">{selectedProject.name}</h4>
                    <div className={`flex items-center space-x-1 ${getStatusColor(selectedProject.status)}`}>
                      {getStatusIcon(selectedProject.status)}
                      <span className="text-sm capitalize">{selectedProject.status}</span>
                    </div>
                  </div>

                  {selectedProject.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {selectedProject.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Tasks</span>
                      <div className="font-medium text-gray-900 dark:text-white">{selectedProject.task_count || 0}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Created</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedProject.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Updated</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedProject.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">ID</span>
                      <div className="font-mono text-xs text-gray-900 dark:text-white">{selectedProject.id}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Project Tasks</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden h-64">
                  <div className="overflow-y-auto max-h-full p-4 space-y-3">
                    {projectTasks.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tasks in this project</p>
                      </div>
                    ) : (
                      projectTasks.map(task => (
                        <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-blue-500">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">{task.description}</h5>
                            <span className={`text-xs px-2 py-1 rounded ${getTaskStatusColor(task.status)} bg-current bg-opacity-10`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {task.subtasks?.length || 0} subtasks
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {new Date(task.created_at).toLocaleString()}
                          </p>
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
                <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Project</h3>
                <p className="text-sm">Choose a project from the list to view its details and tasks.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}