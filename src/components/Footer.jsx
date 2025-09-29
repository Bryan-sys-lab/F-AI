import {
  Github,
  ExternalLink,
  Heart,
  Code,
  Zap,
  Shield,
  Book,
  Mail,
  Globe,
  Settings,
  Activity,
  Folder,
  Monitor
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white border-t border-gray-800">
      <div className="w-full px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">B2.0</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Autonomous AI-powered development platform with advanced frontend interface.
              Modular agents, multi-provider AI integration, and industry best practices.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>v2.0.0</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Enterprise</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#dashboard" className="text-gray-400 hover:text-white transition flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#agents" className="text-gray-400 hover:text-white transition flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Agents
                </a>
              </li>
              <li>
                <a href="#repositories" className="text-gray-400 hover:text-white transition flex items-center">
                  <Folder className="w-4 h-4 mr-2" />
                  Repositories
                </a>
              </li>
              <li>
                <a href="#observability" className="text-gray-400 hover:text-white transition flex items-center">
                  <Monitor className="w-4 h-4 mr-2" />
                  Observability
                </a>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition flex items-center">
                  <Book className="w-4 h-4 mr-2" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition flex items-center">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  API Docs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Creator & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-gray-400">Created with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-gray-400">by the</span>
              <span className="font-semibold text-white">B R$D AI Team</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© {currentYear} B R$D AI. All rights reserved.</span>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">License</a>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All Systems Operational</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>11 Agents Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>6 AI Providers Connected</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}