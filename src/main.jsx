import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import { OutputProvider } from "./providers/OutputContext";
import { TaskProvider } from "./providers/TaskContext";
import { WebSocketProvider } from "./providers/WebSocketContext";
import { AgentProvider } from "./providers/AgentContext";
import { ProviderProvider } from "./providers/ProviderContext";

// ErrorBoundary with reload option
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }
  handleReload = () => {
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">
            🚨 Something went wrong.
          </h2>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
} else {
  // Check if root already exists to prevent double initialization
  if (!window.reactRoot) {
    window.reactRoot = ReactDOM.createRoot(rootElement);
  }

  window.reactRoot.render(
    <React.StrictMode>
      <ThemeProvider>
        <WebSocketProvider>
          <OutputProvider>
            <TaskProvider>
              <AgentProvider>
                <ProviderProvider>
                  <ErrorBoundary>
                    <App />
                  </ErrorBoundary>
                </ProviderProvider>
              </AgentProvider>
            </TaskProvider>
          </OutputProvider>
        </WebSocketProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
