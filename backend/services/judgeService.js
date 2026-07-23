import axios from 'axios';
import vm from 'vm';

const LANG_IDS = {
  javascript: 63, python: 71, java: 62, cpp: 54, c: 50,
  go: 60, rust: 73, typescript: 74, kotlin: 78, swift: 83
};

/**
 * Executes JavaScript code safely in a Node vm sandbox.
 * Captures console outputs and parses precise error line & column positions.
 */
export const executeLocalJavaScript = (code) => {
  let logs = [];
  const sandbox = {
    console: {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(" ")),
      error: (...args) => logs.push("[ERROR] " + args.map(a => String(a)).join(" ")),
      warn: (...args) => logs.push("[WARN] " + args.map(a => String(a)).join(" ")),
      info: (...args) => logs.push(args.map(a => String(a)).join(" ")),
    },
    Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, parseInt, parseFloat, isNaN, isFinite
  };

  try {
    const script = new vm.Script(code, { filename: 'solution.js', timeout: 3000 });
    const context = vm.createContext(sandbox);
    const result = script.runInContext(context, { timeout: 3000 });

    let output = logs.join("\n");
    if (result !== undefined && !output.includes(String(result))) {
      output = output ? `${output}\n-> ${typeof result === 'object' ? JSON.stringify(result) : result}` : `-> ${result}`;
    }

    return {
      stdout: output || "Execution complete. (No console output)",
      stderr: "",
      status: "Accepted",
      statusId: 3,
      line: null,
      column: null
    };
  } catch (err) {
    const errorString = err.stack || err.message || String(err);
    let line = null;
    let column = null;

    // Parse line and column numbers from stack trace (solution.js:line:col)
    const match = errorString.match(/solution\.js:(\d+)(?::(\d+))?/);
    if (match) {
      line = parseInt(match[1], 10);
      if (match[2]) column = parseInt(match[2], 10);
    }

    return {
      stdout: logs.join("\n"),
      stderr: errorString,
      status: err.name || "Runtime Error",
      statusId: 6,
      line,
      column
    };
  }
};

export const executeCode = async (code, language = 'javascript', stdin = '') => {
  const langLower = language?.toLowerCase() || 'javascript';

  // Attempt RapidAPI Judge0 if a key is provided
  if (process.env.JUDGE0_API_KEY && !process.env.JUDGE0_API_KEY.startsWith("your_")) {
    try {
      const { data: sub } = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false',
        { source_code: code, language_id: LANG_IDS[langLower] || 63, stdin },
        { headers: { 'X-RapidAPI-Key': process.env.JUDGE0_API_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com', 'Content-Type': 'application/json' } }
      );
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const { data } = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${sub.token}?base64_encoded=false`,
          { headers: { 'X-RapidAPI-Key': process.env.JUDGE0_API_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' } }
        );
        if (data.status?.id >= 3) {
          const stderr = data.stderr || data.compile_output || '';
          let line = null;
          let column = null;
          if (stderr) {
            const lineMatch = stderr.match(/line (\d+)/i) || stderr.match(/:(\d+):(\d+)?/);
            if (lineMatch) {
              line = parseInt(lineMatch[1], 10);
              if (lineMatch[2]) column = parseInt(lineMatch[2], 10);
            }
          }
          return {
            stdout: data.stdout || '',
            stderr,
            executionTime: data.time || '0',
            memory: data.memory || 0,
            status: data.status?.description || (stderr ? 'Error' : 'Accepted'),
            statusId: data.status?.id,
            line,
            column
          };
        }
      }
      return { stdout: '', stderr: 'Execution timed out (Limit 12s)', status: 'Timeout', statusId: 5, line: null };
    } catch (err) {
      console.warn("Judge0 submission failed, using local executor fallback:", err.message);
    }
  }

  // Fallback: Local JavaScript / TypeScript execution
  if (langLower === 'javascript' || langLower === 'typescript') {
    return executeLocalJavaScript(code);
  }

  return { stdout: '', stderr: '', status: 'No Key' };
};
