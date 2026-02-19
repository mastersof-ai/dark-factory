#!/usr/bin/env node

// Statusline hook — shows Dark Factory update indicator.
// Reads cache written by df-check-update.js (SessionStart hook).
// If another tool (e.g., GSD) owns the statusline, this won't be registered.

const fs = require("fs");
const path = require("path");
const os = require("os");

const home = os.homedir();
const cwd = process.cwd();

function resolveGlobalConfigDir() {
  const envDir = process.env.CLAUDE_CONFIG_DIR;
  if (envDir) {
    // Expand tilde
    if (envDir === "~" || envDir.startsWith("~/")) {
      return path.join(home, envDir.slice(1));
    }
    return path.resolve(envDir);
  }
  return path.join(home, ".claude");
}

// Find cache (local install first, then global)
let cache = null;
const localCache = path.join(cwd, ".claude", "cache", "df-update-check.json");
const globalDir = resolveGlobalConfigDir();
const globalCache = path.join(globalDir, "cache", "df-update-check.json");

try {
  if (fs.existsSync(localCache)) {
    cache = JSON.parse(fs.readFileSync(localCache, "utf8"));
  } else if (fs.existsSync(globalCache)) {
    cache = JSON.parse(fs.readFileSync(globalCache, "utf8"));
  }
} catch {
  // Graceful degradation
}

// Read stdin (required by statusline protocol)
let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  const parts = [];

  if (cache && cache.update_available) {
    parts.push("\x1b[33m\u2B06 /df:update\x1b[0m");
  }

  if (parts.length > 0) {
    process.stdout.write(parts.join(" \u2502 "));
  }
});
