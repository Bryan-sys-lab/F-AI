import { Download, Archive } from "lucide-react";

export default function ZipDownloadCard({ downloadUrl, filename = "project.zip", fileCount = 0 }) {
  const downloadZip = () => {
    // Create a temporary link to trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    a.target = '_blank'; // Open in new tab as fallback
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl rounded-tl-md p-4 shadow-sm border border-blue-200/50 dark:border-blue-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
            <Archive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              📦 Project Archive
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ZIP • {fileCount > 0 ? `${fileCount} files` : 'Multiple files'}
            </p>
          </div>
        </div>
        <button
          onClick={downloadZip}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          title="Download ZIP archive"
        >
          <Download className="w-4 h-4" />
          <span>Download ZIP</span>
        </button>
      </div>

      <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          This archive contains all generated project files for easy download and local development.
        </p>
      </div>
    </div>
  );
}