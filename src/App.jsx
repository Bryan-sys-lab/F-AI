import { useState, useEffect, useRef } from "react";
import ChatInterface from "./components/ChatInterface";
import IntegratedWorkspace from "./components/IntegratedWorkspace";
import AgentStatusDashboard from "./components/AgentStatusDashboard";
import AgentWorkflowVisualization from "./components/AgentWorkflowVisualization";
import ProviderManagementConsole from "./components/ProviderManagementConsole";
import MultiAgentWorkspace from "./components/MultiAgentWorkspace";
import TaskOrchestrationBuilder from "./components/TaskOrchestrationBuilder";
import RepositoryManagementSystem from "./components/RepositoryManagementSystem";
import ObservabilityDashboard from "./components/ObservabilityDashboard";
import SecurityPolicyInterface from "./components/SecurityPolicyInterface";
import PromptEngineeringStudio from "./components/PromptEngineeringStudio";
import AdvancedCodeIntelligence from "./components/AdvancedCodeIntelligence";
import IntegrationEcosystemConnectors from "./components/IntegrationEcosystemConnectors";
import ProjectManagement from "./components/ProjectManagement";
import Footer from "./components/Footer";
import DarkModeToggle from "./components/DarkModeToggle";
import GitHubConnection from "./components/GitHubConnection";
import { Activity, Cpu, GitBranch, Users, Zap, Folder, Monitor, Shield, MessageSquare, Code, ExternalLink, MoreHorizontal } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState('chat');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Navigation items configuration
  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'agents', label: 'Agents', icon: Activity },
    { id: 'providers', label: 'Providers', icon: Cpu },
    { id: 'workspace', label: 'Workspace', icon: Users },
    { id: 'orchestrator', label: 'Orchestrator', icon: Zap },
    { id: 'projects', label: 'Projects', icon: GitBranch },
    { id: 'repositories', label: 'Repos', icon: Folder },
    { id: 'observability', label: 'Observability', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'prompts', label: 'Prompts', icon: MessageSquare },
    { id: 'intelligence', label: 'Intelligence', icon: Code },
    { id: 'integrations', label: 'Integrations', icon: ExternalLink },
  ];

  // Main navigation items (always visible)
  const mainNavItems = navItems.slice(0, 4);
  // Additional items for "More" menu
  const moreNavItems = navItems.slice(4);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900 transition-colors relative flex flex-col overflow-x-hidden">

      {/* Clean Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-4 py-4 sm:py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">B2</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  B2.0
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Development Platform</p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              <GitHubConnection compact={true} />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile First */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
        <nav className="flex items-center justify-around px-1 py-3 max-w-sm mx-auto relative">
          {/* Main navigation items */}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`p-2 rounded-lg transition-all duration-200 flex flex-col items-center space-y-1 min-w-0 flex-1 ${
                  activeView === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            );
          })}

          {/* More menu button */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-2 rounded-lg transition-all duration-200 flex flex-col items-center space-y-1 min-w-0 flex-1 ${
                showMoreMenu
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </button>

            {/* More menu dropdown */}
            {showMoreMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-48">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setShowMoreMenu(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        activeView === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Overlay to close more menu */}
        {showMoreMenu && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowMoreMenu(false)}
          />
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full pb-20 pt-4 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          {activeView === 'chat' && (
            <div className="h-full">
              <IntegratedWorkspace />
            </div>
          )}


        {activeView === 'agents' && (
          <div className="flex-1 overflow-y-auto space-y-6 min-h-0">
            <AgentWorkflowVisualization />
            <AgentStatusDashboard />
          </div>
        )}

        {activeView === 'providers' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <ProviderManagementConsole />
          </div>
        )}

        {activeView === 'workspace' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <MultiAgentWorkspace />
          </div>
        )}

        {activeView === 'orchestrator' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <TaskOrchestrationBuilder />
          </div>
        )}

        {activeView === 'projects' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <ProjectManagement />
          </div>
        )}

        {activeView === 'repositories' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <RepositoryManagementSystem />
          </div>
        )}

        {activeView === 'observability' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <ObservabilityDashboard />
          </div>
        )}

        {activeView === 'security' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <SecurityPolicyInterface />
          </div>
        )}

        {activeView === 'prompts' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <PromptEngineeringStudio />
          </div>
        )}

        {activeView === 'intelligence' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <AdvancedCodeIntelligence />
          </div>
        )}

          {activeView === 'integrations' && (
            <div className="h-full overflow-y-auto">
              <IntegrationEcosystemConnectors />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
