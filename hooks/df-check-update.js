#!/usr/bin/env node

// SessionStart hook — spawns a background process to check npm for updates.
// Writes result to {configDir}/cache/df-update-check.json for the statusline.

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const os = require("os");

const home = os.homedir();
const cwd = process.cwd();

// If running as background child, do the actual check
if (process.argv[2] === "--background") {
  doCheck();
  process.exit(0);
}

// Otherwise, spawn background and exit immediately (non-blocking)
const child = spawn(process.execPath, [__filename, "--background"], {
  detached: true,
  stdio: "ignore",
  env: Object.assign({}, process.env, { HOME: home }),
});
child.unref();

function doCheck() {
  try {
    // Find installed version (local first, then global)
    let installed = "0.0.0";
    let configDir;

    const localVersion = path.join(cwd, ".claude", "dark-factory", "VERSION");
    const globalVersion = path.join(home, ".claude", "dark-factory", "VERSION");

    if (fs.existsSync(localVersion)) {
      installed = fs.readFileSync(localVersion, "utf8").trim();
      configDir = path.join(cwd, ".claude");
    } else if (fs.existsSync(globalVersion)) {
      installed = fs.readFileSync(globalVersion, "utf8").trim();
      configDir = path.join(home, ".claude");
    } else {
      return; // Not installed
    }

    // Check latest version on npm
    let latest;
    try {
      latest = execSync("npm view @mastersof-ai/dark-factory version", {
        encoding: "utf8",
        timeout: 10000,
        windowsHide: true,
      }).trim();
    } catch {
      latest = "unknown";
    }

    // Write cache
    const cacheDir = path.join(configDir, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(cacheDir, "df-update-check.json"),
      JSON.stringify({
        update_available: latest !== "unknown" && installed !== latest,
        installed: installed,
        latest: latest,
        checked: Math.floor(Date.now() / 1000),
      }),
    );
  } catch {
    // Silent failure — never break the session
  }
}
