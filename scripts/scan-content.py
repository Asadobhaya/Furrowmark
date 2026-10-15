#!/usr/bin/env python3
import os
import re
import sys

BANNED_WORDS = [
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
]

BANNED_PATTERNS = [
    ("em-dash or en-dash", re.compile(r"[\u2013\u2014]")),
    ("emoji", re.compile(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]")),
    ("css gradient", re.compile(r"gradient\(", re.IGNORECASE)),
    ("made with/built with badge", re.compile(r"(made|built|generated)\s+with\s+(ai|v0|cursor|chatgpt)", re.IGNORECASE)),
]

EXCLUDED_PATHS = [
    "scripts/scan-banned-content.ts",
    "scripts/scan-content.py",
    "docs/evidence/",
    "docs/tooling.md",
    "docs/conflicts.md",
]

def is_excluded(path_str):
    norm = path_str.replace("\\", "/")
    return any(ex in norm for ex in EXCLUDED_PATHS)

def check_file(file_path):
    violations = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception as e:
        return [f"Could not read {file_path}: {e}"]

    for name, pattern in BANNED_PATTERNS:
        if pattern.search(content):
            violations.append(f"Found {name} in {file_path}")

    for word in BANNED_WORDS:
        word_pattern = re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE)
        if word_pattern.search(content):
            violations.append(f'Found banned word "{word}" in {file_path}')

    return violations

def main():
    root_dir = os.getcwd()
    scanned = 0
    total_violations = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude directories
        dirnames[:] = [d for d in dirnames if d not in [".git", ".next", "node_modules", "evidence"]]
        for f in filenames:
            if re.search(r"\.(ts|tsx|js|jsx|css|md|html)$", f):
                full_path = os.path.join(dirpath, f)
                rel_path = os.path.relpath(full_path, root_dir)
                if not is_excluded(rel_path):
                    scanned += 1
                    v = check_file(full_path)
                    if v:
                        total_violations.extend([f"{rel_path}: {item}" for item in v])

    if total_violations:
        print("Scan failed with banned content violations:")
        for v in total_violations:
            print(f" - {v}")
        sys.exit(1)
    else:
        print(f"Content scan clean: {scanned} files verified against banned patterns and words.")

if __name__ == "__main__":
    main()
