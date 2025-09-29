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
import { Activity, Cpu, GitBranch, Users, Zap, Folder, Monitor, Shield, MessageSquare, Code, ExternalLink } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState('chat'); // 'chat' | 'agents' | 'providers' | 'workspace' | 'orchestrator' | 'repositories' | 'observability' | 'security' | 'prompts' | 'intelligence' | 'integrations' | 'projects'

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors relative flex flex-col overflow-x-hidden">

      {/* Mobile-First Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B2</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  B2.0
                </h1>
              </div>
            </div>


            {/* Right side controls */}
            <div className="flex items-center space-x-2">
              <GitHubConnection compact={true} />
              <DarkModeToggle />
            </div>
          </div>
        </div>

      </header>

      {/* Bottom Navigation - All screen sizes */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
        <nav className="flex items-center justify-around px-2 py-2 max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`p-2 rounded-lg transition-all duration-200 flex flex-col items-center space-y-1 ${
                  activeView === item.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs hidden sm:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main layout */}
      <div className="flex-1 w-full flex flex-col min-h-0 px-4 pb-16 lg:pb-4 overflow-y-auto">
        {activeView === 'chat' && (
          <div className="flex-1 overflow-hidden min-h-0">
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
          <div className="flex-1 overflow-y-auto min-h-0">
            <IntegrationEcosystemConnectors />
          </div>
        )}
      </div>


      {/* Footer */}
      <Footer />
    </div>
  );
}
