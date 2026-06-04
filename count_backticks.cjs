const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split(/\r?\n/);

let inBackticks = false;
let backtickLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Simple count of unescaped backticks
  let chars = line.split('');
  for (let j = 0; j < chars.length; j++) {
    if (chars[j] === '`' && (j === 0 || chars[j-1] !== '\\')) {
      inBackticks = !inBackticks;
      if (inBackticks) {
        backtickLine = i + 1;
      } else {
        backtickLine = -1;
      }
    }
  }
}

if (inBackticks) {
  console.log(`Unclosed backtick starting at line: ${backtickLine}`);
} else {
  console.log("Backticks are balanced!");
}

// Check open/close tags or braces inside envModalTab === "hierarchy"
// Let's print out text around line 3100 to 3260 to check for JSX tags or other mismatch
console.log("File analysis complete.");
