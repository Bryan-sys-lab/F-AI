import { useState } from "react";
import { Maximize2, Download, Image as ImageIcon, BarChart3 } from "lucide-react";

export default function VisualRenderer({ description, fallbackImage, interactive = false }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const downloadImage = () => {
    if (fallbackImage) {
      const link = document.createElement('a');
      link.href = fallbackImage;
      link.download = 'visual-output.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {interactive ? (
              <BarChart3 className="w-4 h-4 text-purple-500" />
            ) : (
              <ImageIcon className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Visual Output
            </span>
            {interactive && (
              <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full">
                Interactive
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="View fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {fallbackImage && (
              <button
                onClick={downloadImage}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Download image"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {description}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex items-center justify-center min-h-64">
          {fallbackImage ? (
            <img
              src={fallbackImage}
              alt="Visual output"
              className="max-w-full max-h-64 object-contain rounded"
            />
          ) : interactive ? (
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Interactive visualization would render here
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                (Chart.js, D3.js, or similar library integration needed)
              </p>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Visual output placeholder
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Image or chart would be displayed here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Visual Output
                </h3>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-400 transform rotate-45" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {fallbackImage ? (
                <img
                  src={fallbackImage}
                  alt="Visual output fullscreen"
                  className="max-w-full max-h-96 object-contain mx-auto"
                />
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Full-size visualization would appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}