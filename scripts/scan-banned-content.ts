import fs from "node:fs";
import path from "node:path";

// Rule: No em-dashes (\u2014), en-dashes (\u2013), emoji, banned marketing fluff, TODO in merged code, or gradients.
const BANNED_WORDS = [
  "seamless",
  "elevate",
  "unlock",
  "empower",
  "revolutionize",
  "cutting-edge",
  "game-changer",
  "in today's world",
  "look no further",
  "lorem ipsum",
  "TODO",
];

const BANNED_PATTERNS = [
  { name: "em-dash or en-dash", regex: /[\u2013\u2014]/g },
  { name: "emoji", regex: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu },
  { name: "css gradient", regex: /gradient\(/gi },
  {
    name: "made with/built with badge",
    regex: /(made|built|generated)\s+with\s+(ai|v0|cursor|chatgpt)/gi,
  },
];

function checkFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf8");
  const violations: string[] = [];

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.regex.test(content)) {
      violations.push(`Found ${pattern.name} in ${filePath}`);
    }
  }

  // Check banned words (case insensitive word boundaries)
  for (const word of BANNED_WORDS) {
    const wordRegex = new RegExp(`\\b${word}\\b`, "i");
    if (wordRegex.test(content)) {
      violations.push(`Found banned word "${word}" in ${filePath}`);
    }
  }

  return violations;
}

function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (
        file !== "node_modules" &&
        file !== ".git" &&
        file !== ".next" &&
        file !== "evidence"
      ) {
        walkDir(fullPath, fileList);
      }
    } else if (/\.(ts|tsx|js|jsx|css|md|html)$/.test(file)) {
      // Exclude scanner itself, doc-scan evidence, and tooling doc which mentions terms descriptively
      if (!filePathIsExcluded(fullPath)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function filePathIsExcluded(p: string): boolean {
  const normalized = p.replace(/\\/g, "/");
  return (
    normalized.includes("scripts/scan-banned-content.ts") ||
    normalized.includes("docs/evidence/") ||
    normalized.includes("docs/tooling.md") ||
    normalized.includes("docs/conflicts.md")
  );
}

function run() {
  const rootDir = process.cwd();
  const files = walkDir(rootDir);
  const totalViolations: string[] = [];

  for (const file of files) {
    const relative = path.relative(rootDir, file);
    const violations = checkFile(file);
    if (violations.length > 0) {
      totalViolations.push(...violations.map((v) => `${relative}: ${v}`));
    }
  }

  if (totalViolations.length > 0) {
    console.error("Scan failed with banned content violations:");
    for (const v of totalViolations) {
      console.error(` - ${v}`);
    }
    process.exit(1);
  } else {
    console.log(
      `Content scan clean: ${files.length} files verified against banned patterns and words.`,
    );
  }
}

run();
