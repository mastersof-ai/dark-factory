#!/usr/bin/env node

// Statusline hook — shows Dark Factory update indicator.
// Reads cache written by df-check-update.js (SessionStart hook).
// If another tool (e.g., GSD) owns the statusline, this won't be registered.

const fs = require("fs");
const path = require("path");
const os = require("os");

const home = os.homedir();
const cwd = process.cwd();

// Find cache (local install first, then global)
let cache = null;
const localCache = path.join(cwd, ".claude", "cache", "df-update-check.json");
const globalCache = path.join(home, ".claude", "cache", "df-update-check.json");

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
