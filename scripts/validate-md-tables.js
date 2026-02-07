import fs from 'fs';
import path from 'path';

const root = process.cwd();
const ignoreDirs = new Set(['node_modules', 'dist', '.git']);

const mdFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (ignoreDirs.has(entry)) continue;
      walk(p);
    } else if (p.endsWith('.md')) {
      mdFiles.push(p);
    }
  }
}

walk(root);

function isDividerLine(line) {
  return /^\s*\|?\s*[:-]+\s*(\|\s*[:-]+\s*)+\|?\s*$/.test(line);
}

function checkTables(content) {
  const lines = content.split(/\r?\n/);
  const issues = [];
  for (let i = 0; i < lines.length - 1; i += 1) {
    const line = lines[i];
    const next = lines[i + 1];
    if (line.includes('|') && isDividerLine(next)) {
      const headerPipes = (line.match(/\|/g) || []).length;
      const dividerPipes = (next.match(/\|/g) || []).length;
      if (headerPipes < 2) {
        issues.push({ line: i + 1, msg: 'Table header has too few pipes' });
      }
      if (dividerPipes < 2) {
        issues.push({ line: i + 2, msg: 'Table divider has too few pipes' });
      }
    }
  }
  return issues;
}

let totalIssues = 0;
for (const file of mdFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const issues = checkTables(content);
  if (issues.length) {
    totalIssues += issues.length;
    const rel = path.relative(root, file);
    console.log(`\n${rel}`);
    for (const issue of issues) {
      console.log(`  line ${issue.line}: ${issue.msg}`);
    }
  }
}

if (totalIssues > 0) {
  console.error(`\nMarkdown table validation failed: ${totalIssues} issue(s).`);
  process.exit(1);
}

console.log('OK: markdown table validation passed');
