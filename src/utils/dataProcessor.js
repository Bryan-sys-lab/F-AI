/**
 * Comprehensive data processing and standardization utility
 * Handles various response formats from backend and standardizes them for frontend components
 */

export class DataProcessor {
  constructor() {
    this.processors = new Map();
    this.registerDefaultProcessors();
  }

  /**
   * Register a data processor for a specific type
   */
  registerProcessor(type, processor) {
    this.processors.set(type, processor);
  }

  /**
   * Process raw data and return standardized aiOutput format
   */
  process(data, context = {}) {
    try {
      // Handle null/undefined
      if (!data) {
        return this.createEmptyOutput();
      }

      // Handle primitive types
      if (typeof data === 'string') {
        return this.processString(data, context);
      }

      if (typeof data === 'number' || typeof data === 'boolean') {
        return this.processPrimitive(data, context);
      }

      // Handle arrays
      if (Array.isArray(data)) {
        return this.processArray(data, context);
      }

      // Handle objects
      if (typeof data === 'object') {
        return this.processObject(data, context);
      }

      return this.createEmptyOutput();

    } catch (error) {
      console.error('Data processing error:', error);
      return this.createErrorOutput(error.message);
    }
  }

  /**
   * Process string data
   */
  processString(data, context) {
    const aiOutput = {};

    // Check if it's JSON
    if (this.looksLikeJson(data)) {
      try {
        const parsed = JSON.parse(data);
        return this.process(parsed, { ...context, fromJsonString: true });
      } catch (e) {
        // Not valid JSON, treat as plain text
      }
    }

    // Check if it's code
    if (this.looksLikeCode(data, context)) {
      aiOutput.inline_code = this.formatCode(data, context.language);
    } else {
      aiOutput.explanatory_summary = data;
    }

    return aiOutput;
  }

  /**
   * Process primitive data types
   */
  processPrimitive(data, context) {
    return {
      explanatory_summary: String(data)
    };
  }

  /**
   * Process array data
   */
  processArray(data, context) {
    const aiOutput = {};

    if (data.length === 0) {
      return this.createEmptyOutput();
    }

    // Check if it's an array of agent responses
    if (this.isAgentResponseArray(data)) {
      return this.processAgentResponseArray(data, context);
    }

    // Check if it's test results
    if (this.isTestResultsArray(data)) {
      aiOutput.executed_results = [{
        type: 'test_results',
        summary: `Test results (${data.length} items)`,
        details: data
      }];
      return aiOutput;
    }

    // Check if it's issues/findings
    if (this.isIssuesArray(data)) {
      aiOutput.executed_results = [{
        type: 'analysis_results',
        summary: `${data.length} issues found`,
        details: data
      }];
      return aiOutput;
    }

    // Default: treat as list of items
    aiOutput.explanatory_summary = data.map(item =>
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join('\n\n');

    return aiOutput;
  }

  /**
   * Process object data
   */
  processObject(data, context) {
    const aiOutput = {};

    // Handle structured agent responses
    if (data.structured && data.structured.files) {
      return this.processStructuredFiles(data, context);
    }

    // Handle direct file responses
    if (data.files) {
      return this.processFileObject(data, context);
    }

    // Handle result/output fields
    if (data.result || data.output) {
      const result = data.result || data.output;
      if (typeof result === 'object') {
        if (this.isExecutedResults(result)) {
          aiOutput.executed_results = [result];
        } else {
          aiOutput.executed_results = [result];
        }
      } else {
        aiOutput.explanatory_summary = String(result);
      }
    }

    // Handle error responses
    if (data.error) {
      aiOutput.explanatory_summary = `**Error:** ${data.error}`;
    }

    // Handle success responses
    if (data.success !== undefined) {
      if (data.success && data.result) {
        aiOutput.explanatory_summary = String(data.result);
      } else if (!data.success && data.error) {
        aiOutput.explanatory_summary = `**Error:** ${data.error}`;
      }
    }

    // Handle agent information
    if (data.name || data.agent) {
      const agentInfo = this.processAgentInfo(data);
      if (agentInfo) {
        aiOutput.explanatory_summary = agentInfo;
      }
    }

    // Handle code snippets
    if (data.code) {
      aiOutput.inline_code = this.formatCode(data.code, data.language);
    }

    // Handle test results
    if (data.tests || data.test_results) {
      const tests = data.tests || data.test_results;
      aiOutput.executed_results = [{
        type: 'test_results',
        summary: data.summary || 'Test execution completed',
        details: tests
      }];
    }

    // Handle analysis results
    if (data.issues || data.findings || data.violations) {
      const issues = data.issues || data.findings || data.violations;
      aiOutput.executed_results = [{
        type: 'analysis_results',
        summary: data.summary || `${issues.length} issues found`,
        details: issues
      }];
    }

    // Handle deployment results
    if (data.deployment || data.deploy) {
      const deploy = data.deployment || data.deploy;
      aiOutput.executed_results = [{
        type: 'deployment_result',
        summary: data.summary || 'Deployment completed',
        details: deploy
      }];
    }

    // Handle repository operations
    if (data.repository || data.repo) {
      const repo = data.repository || data.repo;
      aiOutput.executed_results = [{
        type: 'repository_operation',
        summary: data.summary || 'Repository operation completed',
        details: repo
      }];
    }

    // Handle ZIP downloads
    if (data.zip_download_url || data.zip_download_urls) {
      aiOutput.zip_download_url = data.zip_download_url || data.zip_download_urls[0];
      aiOutput.zip_filename = data.zip_filename || "project.zip";
    }

    // Fallback for generic objects - display as formatted JSON
    if (Object.keys(aiOutput).length === 0) {
      aiOutput.explanatory_summary = this.formatGenericObject(data);
    }

    return aiOutput;
  }

  /**
   * Process structured files response
   */
  processStructuredFiles(data, context) {
    const aiOutput = {};
    const files = data.structured.files;
    const fileEntries = Object.entries(files);

    if (fileEntries.length > 0) {
      // Create file delivery format
      aiOutput.file_delivery = fileEntries.map(([filename, content]) => {
        const codeContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        return {
          filename,
          content: codeContent,
          language: this.detectLanguage(filename, codeContent)
        };
      });

      // Create explanatory summary with description and code
      let summary = "";
      if (data.result) {
        summary += `${String(data.result)}\n\n`;
      }

      // Add each file's code directly in the summary for easy copying
      for (const [filename, content] of fileEntries) {
        const codeContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        const language = this.detectLanguage(filename, codeContent);
        summary += `**${filename}:**\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
      }

      aiOutput.explanatory_summary = summary.trim();

      // Keep inline_code for the first file for backward compatibility
      const [filename, code] = fileEntries[0];
      aiOutput.inline_code = `\`\`\`${this.detectLanguage(filename, code)}\n${code}\n\`\`\``;
    } else if (data.result) {
      aiOutput.explanatory_summary = String(data.result);
    }

    return aiOutput;
  }

  /**
   * Process file object response
   */
  processFileObject(data, context) {
    const aiOutput = {};
    const fileEntries = Object.entries(data.files);

    if (fileEntries.length > 0) {
      aiOutput.file_delivery = fileEntries.map(([filename, content]) => {
        const codeContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        return {
          filename,
          content: codeContent,
          language: this.detectLanguage(filename, codeContent)
        };
      });

      // Create explanatory summary with description and code
      let summary = "";
      if (data.description) {
        summary += `${data.description}\n\n`;
      }

      // Add each file's code directly in the summary for easy copying
      for (const [filename, content] of fileEntries) {
        const codeContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        const language = this.detectLanguage(filename, codeContent);
        summary += `**${filename}:**\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
      }

      aiOutput.explanatory_summary = summary.trim();

      // Keep inline_code for the first file for backward compatibility
      const [filename, code] = fileEntries[0];
      aiOutput.inline_code = `\`\`\`${this.detectLanguage(filename, code)}\n${code}\n\`\`\``;
    } else if (data.description) {
      aiOutput.explanatory_summary = data.description;
    }

    return aiOutput;
  }

  /**
   * Process agent response arrays
   */
  processAgentResponseArray(responses, context) {
    const aiOutput = {};

    for (const response of responses) {
      // Merge results from each response
      const processed = this.processObject(response, context);
      Object.assign(aiOutput, processed);
    }

    return aiOutput;
  }

  /**
   * Process agent information
   */
  processAgentInfo(data) {
    const agentName = data.name || data.agent || 'Agent';
    const role = data.role || data.description || 'AI Assistant';

    let info = `**${agentName}**: ${role}`;

    if (data.frameworks) {
      const frameworks = Array.isArray(data.frameworks) ? data.frameworks.join(', ') : data.frameworks;
      info += `\n\n**Frameworks:** ${frameworks}`;
    }

    if (data.tasks) {
      const tasks = Array.isArray(data.tasks) ? data.tasks.map(task => `- ${task}`).join('\n') : data.tasks;
      info += `\n\n**Tasks:**\n${tasks}`;
    }

    return info;
  }

  /**
   * Format code with proper syntax highlighting
   */
  formatCode(code, language) {
    const detectedLang = language || 'python';
    return `\`\`\`${detectedLang}\n${code}\n\`\`\``;
  }

  /**
   * Format generic objects for display
   */
  formatGenericObject(data) {
    // Special handling for objects with files
    if (data.files && typeof data.files === 'object') {
      let summary = "";
      if (data.description) {
        summary += `${data.description}\n\n`;
      }

      // Add each file's code directly for easy copying
      for (const [filename, content] of Object.entries(data.files)) {
        const codeContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        const language = this.detectLanguage(filename, codeContent);
        summary += `**${filename}:**\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
      }

      return summary.trim();
    }

    // Create a readable summary of the object
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return "Empty object";
    }

    let summary = `**Response Data:**\n\n`;

    // Add key-value pairs in a readable format
    for (const [key, value] of Object.entries(data)) {
      const formattedKey = `**${key}:** `;
      let formattedValue;

      if (value === null) {
        formattedValue = "null";
      } else if (value === undefined) {
        formattedValue = "undefined";
      } else if (typeof value === 'string') {
        formattedValue = `"${value}"`;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        formattedValue = String(value);
      } else if (Array.isArray(value)) {
        formattedValue = `Array with ${value.length} items`;
      } else if (typeof value === 'object') {
        formattedValue = `Object with ${Object.keys(value).length} properties`;
      } else {
        formattedValue = String(value);
      }

      summary += `${formattedKey}${formattedValue}\n`;
    }

    // Also include the full JSON for reference
    summary += `\n**Full JSON:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;

    return summary;
  }

  /**
   * Detect language from filename and content
   */
  detectLanguage(filename, content = '') {
    // First try filename extension
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'txt': 'text'
    };

    if (langMap[ext]) {
      return langMap[ext];
    }

    // Fallback: detect from content patterns
    if (typeof content === 'string') {
      const trimmed = content.trim();

      // PHP detection
      if (trimmed.startsWith('<?php') || trimmed.includes('<?php') || /function\s+\w+\s*\(/.test(trimmed) && trimmed.includes('$')) {
        return 'php';
      }

      // JavaScript detection
      if (/function\s+\w+\s*\(/.test(trimmed) && (trimmed.includes('const ') || trimmed.includes('let ') || trimmed.includes('var '))) {
        return 'javascript';
      }

      // Python detection
      if (/def\s+\w+\s*\(/.test(trimmed) || trimmed.includes('import ') || trimmed.includes('from ')) {
        return 'python';
      }

      // HTML detection
      if (trimmed.includes('<html') || trimmed.includes('<!DOCTYPE html') || /^<\w+/.test(trimmed)) {
        return 'html';
      }

      // CSS detection
      if (trimmed.includes('{') && trimmed.includes('}') && (trimmed.includes(':') || trimmed.includes(';'))) {
        return 'css';
      }

      // Java detection
      if (trimmed.includes('public class') || trimmed.includes('import java.')) {
        return 'java';
      }

      // C/C++ detection
      if (trimmed.includes('#include') || trimmed.includes('int main(')) {
        return 'cpp';
      }

      // Go detection
      if (trimmed.includes('package main') || trimmed.includes('func ')) {
        return 'go';
      }

      // Ruby detection
      if (trimmed.includes('def ') && trimmed.includes('end')) {
        return 'ruby';
      }

      // Rust detection
      if (trimmed.includes('fn ') || trimmed.includes('let ') && trimmed.includes('mut ')) {
        return 'rust';
      }
    }

    return 'python'; // Default fallback
  }

  /**
   * Check if data looks like JSON
   */
  looksLikeJson(data) {
    const trimmed = data.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
           (trimmed.startsWith('[') && trimmed.endsWith(']'));
  }

  /**
   * Check if data looks like code
   */
  looksLikeCode(data, context) {
    // Check for code patterns
    const codePatterns = [
      /def\s+\w+\s*\(/,  // Python function
      /function\s+\w+\s*\(/,  // JavaScript function
      /class\s+\w+/,  // Class definition
      /import\s+.*from/,  // Import statement
      /const\s+\w+\s*=/,  // Variable assignment
      /let\s+\w+\s*=/,  // Variable assignment
      /var\s+\w+\s*=/,  // Variable assignment
      /public\s+class/,  // Java class
      /#include/,  // C/C++ include
    ];

    return codePatterns.some(pattern => pattern.test(data)) ||
           data.includes('```') ||
           (context && context.expectedCode);
  }

  /**
   * Check if array is agent responses
   */
  isAgentResponseArray(data) {
    return data.length > 0 &&
           data.every(item => typeof item === 'object' &&
                            (item.result || item.output || item.error || item.success !== undefined));
  }

  /**
   * Check if array is test results
   */
  isTestResultsArray(data) {
    return data.length > 0 &&
           data.every(item => typeof item === 'object' &&
                            (item.test || item.name || item.status || item.passed !== undefined));
  }

  /**
   * Check if array is issues/findings
   */
  isIssuesArray(data) {
    return data.length > 0 &&
           data.every(item => typeof item === 'object' &&
                            (item.severity || item.message || item.line || item.rule));
  }

  /**
   * Check if object is executed results
   */
  isExecutedResults(data) {
    return data.type &&
           (data.summary || data.details || data.results);
  }

  /**
   * Register default processors
   */
  registerDefaultProcessors() {
    // Register custom processors for specific data types
    this.registerProcessor('agent_response', (data) => this.processAgentResponseArray(data, {}));
    this.registerProcessor('file_response', (data) => this.processStructuredFiles(data, {}));
    this.registerProcessor('test_results', (data) => ({
      executed_results: [{
        type: 'test_results',
        summary: `Test results (${data.length} items)`,
        details: data
      }]
    }));

    // Register processors for new response types
    this.registerProcessor('direct_response', (data, context) => ({
      explanatory_summary: data.response || data
    }));

    this.registerProcessor('about_response', (data, context) => ({
      explanatory_summary: data.response || data,
      system_info: {
        name: 'B',
        creator: 'NOVA tech',
        type: 'AI Assistant System'
      }
    }));

    this.registerProcessor('query_response', (data, context) => ({
      explanatory_summary: data.response || data
    }));

    // Register processor for WebSocket task updates
    this.registerProcessor('task_update', (data, context) => {
      if (data.type === 'output' && data.message) {
        try {
          const parsed = JSON.parse(data.message);
          return this.process(parsed, { ...context, fromWebSocket: true });
        } catch (e) {
          return { explanatory_summary: data.message };
        }
      }
      return { explanatory_summary: JSON.stringify(data, null, 2) };
    });
  }

  /**
   * Process data with custom processor if available
   */
  processWithCustomProcessor(data, type, context = {}) {
    const processor = this.processors.get(type);
    if (processor) {
      try {
        return processor(data, context);
      } catch (error) {
        console.warn(`Custom processor for type '${type}' failed:`, error);
        // Fall back to default processing
      }
    }
    return null;
  }

  /**
   * Enhanced process method with custom processor support
   */
  process(data, context = {}) {
    // Try custom processors first based on context
    if (context.source) {
      const customResult = this.processWithCustomProcessor(data, context.source, context);
      if (customResult) {
        return customResult;
      }
    }

    // Try type-based custom processors
    if (typeof data === 'object' && data !== null && data.type) {
      const customResult = this.processWithCustomProcessor(data, data.type, context);
      if (customResult) {
        return customResult;
      }
    }

    // Fall back to default processing
    return this.defaultProcess(data, context);
  }

  /**
   * Default processing logic (renamed from original process)
   */
  defaultProcess(data, context = {}) {
    try {
      // Handle null/undefined
      if (!data) {
        return this.createEmptyOutput();
      }

      // Handle primitive types
      if (typeof data === 'string') {
        return this.processString(data, context);
      }

      if (typeof data === 'number' || typeof data === 'boolean') {
        return this.processPrimitive(data, context);
      }

      // Handle arrays
      if (Array.isArray(data)) {
        return this.processArray(data, context);
      }

      // Handle objects
      if (typeof data === 'object') {
        return this.processObject(data, context);
      }

      return this.createEmptyOutput();

    } catch (error) {
      console.error('Data processing error:', error);
      return this.createErrorOutput(error.message);
    }
  }

  /**
   * Create empty output
   */
  createEmptyOutput() {
    return {
      explanatory_summary: "No content to display"
    };
  }

  /**
   * Create error output
   */
  createErrorOutput(message) {
    return {
      explanatory_summary: `**Processing Error:** ${message}`
    };
  }

  /**
   * Validate aiOutput format and sanitize
   */
  validateOutput(aiOutput) {
    const validKeys = [
      'explanatory_summary',
      'inline_code',
      'executed_results',
      'file_delivery',
      'zip_download_url',
      'zip_filename',
      'canvas_editor',
      'visual_output',
      'system_info'
    ];

    // Filter out invalid keys
    const sanitized = {};
    for (const [key, value] of Object.entries(aiOutput)) {
      if (validKeys.includes(key)) {
        sanitized[key] = value;
      } else {
        console.warn(`Filtering out invalid aiOutput key: ${key}`);
      }
    }

    // Validate specific field types
    if (sanitized.executed_results && !Array.isArray(sanitized.executed_results)) {
      console.warn('executed_results should be an array, converting to array');
      sanitized.executed_results = [sanitized.executed_results];
    }

    if (sanitized.file_delivery && !Array.isArray(sanitized.file_delivery)) {
      console.warn('file_delivery should be an array, converting to array');
      sanitized.file_delivery = [sanitized.file_delivery];
    }

    // Ensure required fields have proper types
    if (sanitized.explanatory_summary && typeof sanitized.explanatory_summary !== 'string') {
      sanitized.explanatory_summary = String(sanitized.explanatory_summary);
    }

    if (sanitized.inline_code && typeof sanitized.inline_code !== 'string') {
      sanitized.inline_code = String(sanitized.inline_code);
    }

    return sanitized;
  }

  /**
   * Get statistics about processed data
   */
  getProcessingStats() {
    return {
      registeredProcessors: this.processors.size,
      supportedTypes: Array.from(this.processors.keys())
    };
  }

  /**
   * Add middleware for processing pipeline
   */
  addMiddleware(middleware) {
    const originalProcess = this.process.bind(this);
    this.process = (data, context) => {
      const result = middleware(data, context, originalProcess);
      return result;
    };
  }

  /**
   * Create a processing pipeline
   */
  createPipeline(...middlewares) {
    return (data, context) => {
      let result = data;
      for (const middleware of middlewares) {
        result = middleware(result, context);
      }
      return this.process(result, context);
    };
  }

  /**
   * Batch process multiple data items
   */
  batchProcess(dataArray, context = {}) {
    return dataArray.map((data, index) =>
      this.process(data, { ...context, batchIndex: index, batchSize: dataArray.length })
    );
  }

  /**
   * Deep clone and process (for immutable operations)
   */
  processImmutable(data, context = {}) {
    const clonedData = JSON.parse(JSON.stringify(data));
    return this.process(clonedData, context);
  }

  /**
   * Get supported data types
   */
  getSupportedTypes() {
    return {
      primitives: ['string', 'number', 'boolean'],
      objects: ['agent_response', 'file_response', 'test_results', 'structured_files'],
      arrays: ['test_results', 'issues', 'findings'],
      custom: Array.from(this.processors.keys())
    };
  }
}

// Export singleton instance
export const dataProcessor = new DataProcessor();