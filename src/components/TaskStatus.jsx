import { useTask } from "../providers/TaskContext";

export default function TaskStatus() {
  const { taskStatus, progress } = useTask();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Idle': return 'text-gray-600 dark:text-gray-400';
      case 'Running': return 'text-blue-600 dark:text-blue-400';
      case 'Completed': return 'text-green-600 dark:text-green-400';
      case 'Failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProgressGradient = (status) => {
    switch (status) {
      case 'Idle': return 'from-gray-400 to-gray-500';
      case 'Running': return 'from-blue-400 to-indigo-500';
      case 'Completed': return 'from-green-400 to-emerald-500';
      case 'Failed': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
      <h2 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Task Status
      </h2>
      <div className="space-y-3">
        <p className="text-gray-700 dark:text-gray-300">
          Status: <span className={`font-medium ${getStatusColor(taskStatus)}`}>{taskStatus}</span>
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${getProgressGradient(taskStatus)} h-3 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{progress}% Complete</p>
      </div>
    </div>
  );
}
