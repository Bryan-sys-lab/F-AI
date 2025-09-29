import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useOutput } from './OutputContext';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [taskStatus, setTaskStatus] = useState('Idle');
  const [progress, setProgress] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [displayedTasks, setDisplayedTasks] = useState(() => new Set());
  const [subTasks, setSubTasks] = useState([]);
  const pollingIntervalRef = useRef(null);
  const currentTaskIdRef = useRef(null);
  const { addOutput } = useOutput();

  const updateTaskStatus = useCallback((status, progressValue = 0) => {
    setTaskStatus(status);
    setProgress(progressValue);
  }, []);

  const startTask = useCallback(() => {
    setTaskStatus('Running');
    setProgress(0);
  }, []);

  const completeTask = useCallback(() => {
    setTaskStatus('Completed');
    setProgress(100);
  }, []);

  const failTask = useCallback(() => {
    setTaskStatus('Failed');
    setProgress(0);
  }, []);

  const resetTask = useCallback(() => {
    console.log('resetTask called');
    setTaskStatus('Idle');
    setProgress(0);
    setCurrentTaskId(null);
    currentTaskIdRef.current = null;
    setSubTasks([]);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Poll for task status updates via HTTP
  const pollTaskStatus = useCallback(async (taskId = null) => {
    const activeTaskId = taskId || currentTaskIdRef.current;
    console.log('pollTaskStatus called, taskId:', activeTaskId, 'currentTaskId:', currentTaskId, 'ref:', currentTaskIdRef.current);
    if (!activeTaskId) {
      console.log('No taskId, returning');
      return;
    }

    console.log('Polling task status for:', activeTaskId);
    try {
      const response = await fetch(`/api/tasks/${activeTaskId}`);
      console.log('Poll response status:', response.status);
      if (response.ok) {
        const task = await response.json();
        console.log('Task data received:', task);
        console.log('Task status:', task.status, 'output:', task.output);

        // Parse JSON output if it's a string
        let parsedOutput = task.output;
        if (typeof task.output === 'string' && task.output.trim().startsWith('{')) {
          try {
            parsedOutput = JSON.parse(task.output);
            console.log('Parsed JSON output:', parsedOutput);
          } catch (e) {
            console.log('Failed to parse output as JSON, using as string');
          }
        }

        // Convert legacy format to new format
        if (parsedOutput && typeof parsedOutput === 'object' && parsedOutput.files && !parsedOutput.file_delivery) {
          const fileDelivery = Object.entries(parsedOutput.files).map(([filename, content]) => ({
            filename,
            content,
            language: filename.split('.').pop()
          }));

          parsedOutput = {
            file_delivery: fileDelivery,
            explanatory_summary: parsedOutput.description || 'Generated files:'
          };
          console.log('Converted legacy format to new format:', parsedOutput);
        }

        // Update subtasks if available
        if (task.subtasks) {
          setSubTasks(task.subtasks);
        }
        const status = task.status;
        console.log('Processing status:', status);

        // Map backend status to frontend status
        switch (status) {
          case 'pending':
            updateTaskStatus('Running', 25);
            break;
          case 'running':
            updateTaskStatus('Running', 50);
            break;
          case 'completed':
            updateTaskStatus('Completed', 100);
            // Display task output in the chat only once - simplified for user experience
            if (!displayedTasks.has(activeTaskId)) {
              setDisplayedTasks(prev => new Set([...prev, activeTaskId]));

              // Check if output contains structured AI modes
              const hasAIModes = parsedOutput && typeof parsedOutput === 'object' &&
                (parsedOutput.inline_code || parsedOutput.executed_results ||
                 parsedOutput.file_delivery || parsedOutput.canvas_editor ||
                 parsedOutput.visual_output || parsedOutput.explanatory_summary);

              if (hasAIModes) {
                // Automatically save generated files to workspace
                if (parsedOutput.file_delivery && Array.isArray(parsedOutput.file_delivery)) {
                  parsedOutput.file_delivery.forEach(async (file) => {
                    try {
                      const response = await fetch(`/api/workspace/files/${encodeURIComponent(file.filename)}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: file.content })
                      });
                      if (response.ok) {
                        console.log('AI-generated file saved to workspace:', file.filename);
                      } else {
                        console.error('Failed to save AI-generated file:', file.filename, response.status);
                      }
                    } catch (error) {
                      console.error('Error saving AI-generated file:', file.filename, error);
                    }
                  });
                }

                // Add AI output with structured modes
                addOutput({
                  type: 'ai',
                  content: '',
                  aiOutput: parsedOutput
                });
              } else if (typeof parsedOutput === 'string' && parsedOutput.trim()) {
                // Treat string responses as markdown content
                addOutput({
                  type: 'ai',
                  content: '',
                  aiOutput: {
                    explanatory_summary: parsedOutput
                  }
                });
              } else if (typeof parsedOutput === 'object' && Object.keys(parsedOutput).length > 0) {
                // Show aggregated results in a cleaner format
                if (parsedOutput.aggregated && Array.isArray(parsedOutput.aggregated)) {
                  // Display individual aggregated results
                  parsedOutput.aggregated.forEach((result, index) => {
                    if (result.response && result.response !== 'Executed') {
                      // Try to extract code from response
                      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
                      const matches = [...result.response.matchAll(codeBlockRegex)];

                      if (matches.length > 0) {
                        matches.forEach((match) => {
                          const [, language, code] = match;
                          addOutput({
                            type: 'code',
                            language: language || 'python',
                            content: code.trim()
                          });
                        });
                      } else {
                        addOutput({
                          type: 'comment',
                          content: result.response
                        });
                      }
                    } else if (result.error) {
                      addOutput({
                        type: 'error',
                        content: `Error: ${result.error}`
                      });
                    }
                  });
                } else {
                  // Check for ZIP download URLs first
                  if (parsedOutput.zip_download_urls && Array.isArray(parsedOutput.zip_download_urls)) {
                    parsedOutput.zip_download_urls.forEach(zipUrl => {
                      addOutput({
                        type: 'download',
                        content: `📦 Download project files: ${zipUrl}`,
                        downloadUrl: zipUrl
                      });
                    });
                  } else if (parsedOutput.zip_download_url) {
                    addOutput({
                      type: 'download',
                      content: `📦 Download project files: ${parsedOutput.zip_download_url}`,
                      downloadUrl: parsedOutput.zip_download_url
                    });
                  }

                  // Try to extract code from structured output
                  const codeContent = parsedOutput.code || parsedOutput.result || parsedOutput.content;
                  if (codeContent && typeof codeContent === 'string') {
                    addOutput({
                      type: 'code',
                      language: parsedOutput.language || 'python',
                      content: codeContent
                    });
                  } else if (parsedOutput.response && typeof parsedOutput.response === 'string') {
                    // Handle conversational responses
                    addOutput({
                      type: 'comment',
                      content: parsedOutput.response
                    });
                  } else {
                    addOutput({
                      type: 'comment',
                      content: `Result: ${JSON.stringify(parsedOutput, null, 2)}`
                    });
                  }
                }
              } else {
                // No output at all - show a default message
                addOutput({
                  type: 'comment',
                  content: 'Task completed successfully'
                });
              }
            }
            // Stop polling when task is complete
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            // Clear current task ID to stop any further polling
            setCurrentTaskId(null);
            currentTaskIdRef.current = null;
            setSubTasks([]);
            break;
          case 'failed':
            updateTaskStatus('Failed', 0);
            if (!displayedTasks.has(activeTaskId)) {
              setDisplayedTasks(prev => new Set([...prev, activeTaskId]));
              addOutput({
                type: 'comment',
                content: `❌ Task failed: ${task.description}`
              });
            }
            // Stop polling when task fails
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            // Clear current task ID to stop any further polling
            setCurrentTaskId(null);
            break;
          default:
            // Handle any other status values that might indicate completion
            if (status === 'success' || status === 'done' || status === 'finished') {
              updateTaskStatus('Completed', 100);
              // Display task output for completion-like statuses
              if (!(displayedTasks instanceof Set ? displayedTasks.has(currentTaskId) : false)) {
                setDisplayedTasks(prev => {
                  const currentSet = prev instanceof Set ? prev : new Set();
                  return new Set([...currentSet, currentTaskId]);
                });

                addOutput({
                  type: 'comment',
                  content: `✅ Task completed: ${task.description}`
                });

                // Show task output if available
                if (parsedOutput) {
                  addOutput({
                    type: 'comment',
                    content: `📄 Result: ${JSON.stringify(parsedOutput, null, 2)}`
                  });
                }
              }
              // Stop polling
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              // Clear current task ID to stop any further polling
              setCurrentTaskId(null);
            } else {
              updateTaskStatus('Idle', 0);
            }
        }
      }
    } catch (error) {
      console.error('Failed to poll task status:', error);
    }
  }, [currentTaskId, updateTaskStatus, addOutput]);

  // Start polling when a task is created
  const startTaskPolling = useCallback((taskId, taskDescription) => {
    console.log('startTaskPolling called with taskId:', taskId, 'description:', taskDescription);
    setCurrentTaskId(taskId);
    currentTaskIdRef.current = taskId;
    console.log('Set currentTaskId to:', taskId);
    setDisplayedTasks(prev => {
      const currentSet = prev instanceof Set ? prev : new Set();
      return new Set([...Array.from(currentSet).filter(id => id !== taskId)]);
    }); // Remove from displayed if retrying
    startTask();


    // Start polling every 5 seconds with a 5-minute timeout
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    let pollCount = 0;
    const maxPolls = 60; // 5 minutes max

    console.log('Setting up polling interval');
    pollingIntervalRef.current = setInterval(() => {
      pollCount++;
      console.log('Poll interval triggered, count:', pollCount);
      if (pollCount >= maxPolls) {
        console.log('Polling timeout reached');
        // Timeout - mark as failed
        updateTaskStatus('Failed', 0);
        setCurrentTaskId(null);
        currentTaskIdRef.current = null;
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        if (!displayedTasks.has(taskId)) {
          setDisplayedTasks(prev => new Set([...prev, taskId]));
          addOutput({
            type: 'error',
            content: 'Task timed out after 5 minutes. The backend may not be responding.'
          });
        }
        return;
      }
      pollTaskStatus();
    }, 5000);

    console.log('Polling interval set up, polling immediately');
    // Poll immediately with the taskId
    pollTaskStatus(taskId);
  }, [startTask, pollTaskStatus, addOutput, updateTaskStatus, displayedTasks]);

  // Clean up polling on unmount
  useEffect(() => {
    console.log('TaskProvider unmount cleanup');
    return () => {
      if (pollingIntervalRef.current) {
        console.log('Clearing polling interval on unmount');
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Clear lingering intervals if currentTaskId is null
  useEffect(() => {
    if (!currentTaskId && pollingIntervalRef.current) {
      console.log('Clearing lingering polling interval because currentTaskId is null');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [currentTaskId]);

  return (
    <TaskContext.Provider value={{
      taskStatus,
      progress,
      currentTaskId,
      subTasks,
      updateTaskStatus,
      startTask,
      startTaskPolling,
      completeTask,
      failTask,
      resetTask
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}