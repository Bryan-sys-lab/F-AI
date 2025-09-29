import { useState } from "react";
import { FileText, Save, RotateCcw, Eye, EyeOff } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function EditableDocument({ fullCode, filename = "document", language = "text" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(fullCode);
  const [originalCode] = useState(fullCode);
  const isDark = document.documentElement.classList.contains("dark");

  const handleSave = () => {
    // In a real implementation, this would save to backend
    console.log('Saving edited code:', editedCode);
    setIsEditing(false);
  };

  const handleRevert = () => {
    setEditedCode(originalCode);
    setIsEditing(false);
  };

  const hasChanges = editedCode !== originalCode;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {filename}
          </span>
          {hasChanges && (
            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">
              Modified
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleRevert}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                title="Revert changes"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Revert</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                title="Save changes"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              title="Edit document"
            >
              <Eye className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="w-full h-96 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Edit your code here..."
          />
        ) : (
          <div className="max-h-96 overflow-auto">
            <SyntaxHighlighter
              style={isDark ? oneDark : oneLight}
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.875rem",
                background: "transparent",
                border: "none"
              }}
              wrapLongLines={true}
            >
              {editedCode}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}