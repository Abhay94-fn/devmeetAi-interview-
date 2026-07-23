/**
 * Language configuration for the code editor and Judge0 execution.
 * Each entry maps to a Monaco editor language ID and Judge0 language ID.
 */
const LANGUAGES = [
  {
    id: 'javascript',
    name: 'JavaScript',
    monacoId: 'javascript',
    judgeId: 63,
    icon: '🟨',
    starter: 'function solve(input) {\n  // Write your solution here\n  return null;\n}\n\n// Test\nconsole.log(solve());',
  },
  {
    id: 'python',
    name: 'Python',
    monacoId: 'python',
    judgeId: 71,
    icon: '🐍',
    starter: 'def solve(input):\n    # Write your solution here\n    pass\n\n# Test\nprint(solve(None))',
  },
  {
    id: 'java',
    name: 'Java',
    monacoId: 'java',
    judgeId: 62,
    icon: '☕',
    starter: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Hello");\n    }\n}',
  },
  {
    id: 'cpp',
    name: 'C++',
    monacoId: 'cpp',
    judgeId: 54,
    icon: '⚙️',
    starter: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    cout << "Hello" << endl;\n    return 0;\n}',
  },
  {
    id: 'c',
    name: 'C',
    monacoId: 'c',
    judgeId: 50,
    icon: '🔧',
    starter: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    printf("Hello\\n");\n    return 0;\n}',
  },
  {
    id: 'go',
    name: 'Go',
    monacoId: 'go',
    judgeId: 60,
    icon: '🐹',
    starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// Write your solution here\n\tfmt.Println("Hello")\n}',
  },
  {
    id: 'rust',
    name: 'Rust',
    monacoId: 'rust',
    judgeId: 73,
    icon: '🦀',
    starter: 'fn main() {\n    // Write your solution here\n    println!("Hello");\n}',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    monacoId: 'typescript',
    judgeId: 74,
    icon: '🔷',
    starter: 'function solve(input: any): any {\n  // Write your solution here\n  return null;\n}\n\nconsole.log(solve(null));',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    monacoId: 'kotlin',
    judgeId: 78,
    icon: '🟣',
    starter: 'fun main() {\n    // Write your solution here\n    println("Hello")\n}',
  },
  {
    id: 'swift',
    name: 'Swift',
    monacoId: 'swift',
    judgeId: 83,
    icon: '🍊',
    starter: 'import Foundation\n\n// Write your solution here\nprint("Hello")',
  },
];

export const getLanguageById = (id) => LANGUAGES.find((l) => l.id === id) || LANGUAGES[0];
export const getLanguageByJudgeId = (judgeId) => LANGUAGES.find((l) => l.judgeId === judgeId);
export const getStarterCode = (langId) => getLanguageById(langId)?.starter || '';

export default LANGUAGES;
