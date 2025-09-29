import { Download, FileText, FileJson, FileSpreadsheet, FileCode, FileImage, File } from "lucide-react";

export default function DownloadCard({ files }) {
  const getFileIcon = (ext) => {
    if (!ext) return <File className="w-5 h-5" />;
    const extLower = ext.toLowerCase();
    if (['json'].includes(extLower)) return <FileJson className="w-5 h-5" />;
    if (['csv', 'xlsx', 'xls'].includes(extLower)) return <FileSpreadsheet className="w-5 h-5" />;
    if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'go', 'rs'].includes(extLower)) return <FileCode className="w-5 h-5" />;
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(extLower)) return <FileImage className="w-5 h-5" />;
    if (['txt', 'md'].includes(extLower)) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getFileSize = (content) => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!files || !Array.isArray(files) || files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {files.map((file, index) => {
        const extension = file.filename.split('.').pop() || file.language || 'txt';
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {getFileIcon(extension)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {file.filename}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {extension.toUpperCase()} • {getFileSize(file.content)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadFile(file.filename, file.content)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-200"
                title="Download file"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            {/* Preview for small text files */}
            {file.content.length < 1000 && ['txt', 'md', 'json'].includes(extension.toLowerCase()) && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono max-h-32 overflow-auto">
                  {file.content}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}