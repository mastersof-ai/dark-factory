import {
  existsSync,
  mkdirSync,
  cpSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, "..");
const HOOKS_DIR = join(PKG_ROOT, "hooks");
const VERSION = JSON.parse(
  readFileSync(join(PKG_ROOT, "package.json"), "utf8"),
).version;

// Paths relative to their copy root that are never overwritten during updates.
const PRESERVED_FILES = new Set([]);

// ---------------------------------------------------------------------------
// File copying
// ---------------------------------------------------------------------------

function copyTree(src, dest, { preserveExisting = false } = {}) {
  const copied = [];
  const skipped = [];

  function walk(srcDir, destDir) {
    for (const entry of readdirSync(srcDir)) {
      const srcPath = join(srcDir, entry);
      const destPath = join(destDir, entry);
      const relPath = relative(dest, destPath);

      if (statSync(srcPath).isDirectory()) {
        walk(srcPath, destPath);
      } else {
        const shouldPreserve =
          preserveExisting && existsSync(destPath) && PRESERVED_FILES.has(relPath);

        if (shouldPreserve) {
          skipped.push(relPath);
        } else {
          mkdirSync(dirname(destPath), { recursive: true });
          cpSync(srcPath, destPath);
          copied.push(relPath);
        }
      }
    }
  }

  walk(src, dest);
  return { copied, skipped };
}

// ---------------------------------------------------------------------------
// Settings.json merging
// ---------------------------------------------------------------------------

function readSettings(configDir) {
  const settingsPath = join(configDir, "settings.json");
  if (existsSync(settingsPath)) {
    try {
      return JSON.parse(readFileSync(settingsPath, "utf8"));
    } catch {
      return {};
    }
  }
  return {};
}

function writeSettings(configDir, settings) {
  const settingsPath = join(configDir, "settings.json");
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
}

function hookCommand(configDir, hookFile) {
  return `node "${join(configDir, "hooks", hookFile)}"`;
}

function registerHooks(configDir) {
  const settings = readSettings(configDir);

  // Ensure hooks structure exists
  if (!settings.hooks) settings.hooks = {};
  if (!Array.isArray(settings.hooks.SessionStart)) settings.hooks.SessionStart = [];

  // Remove any existing DF hooks (clean reinstall)
  // Handle both old format ({type, command}) and new format ({matcher, hooks})
  settings.hooks.SessionStart = settings.hooks.SessionStart.filter(
    (h) => {
      const cmd = h.command || (h.hooks && h.hooks[0]?.command) || "";
      return !cmd.includes("df-check-update");
    },
  );

  // Add update check hook (new matcher format)
  settings.hooks.SessionStart.push({
    matcher: "",
    hooks: [
      {
        type: "command",
        command: hookCommand(configDir, "df-check-update.js"),
      },
    ],
  });

  // Register statusline only if none exists
  if (!settings.statusLine) {
    settings.statusLine = {
      type: "command",
      command: hookCommand(configDir, "df-statusline.js"),
    };
  }

  writeSettings(configDir, settings);
}

// ---------------------------------------------------------------------------
// Install / Update
// ---------------------------------------------------------------------------

function install(configDir, { isUpdate = false } = {}) {
  mkdirSync(configDir, { recursive: true });

  // 1. Copy command files
  const cmdResult = copyTree(
    join(PKG_ROOT, "commands"),
    join(configDir, "commands"),
  );

  // 2. Copy df internals
  const dfResult = copyTree(
    join(PKG_ROOT, "df"),
    join(configDir, "df"),
  );

  // 3. Copy hooks
  const hooksDestDir = join(configDir, "hooks");
  mkdirSync(hooksDestDir, { recursive: true });
  for (const hookFile of readdirSync(HOOKS_DIR)) {
    cpSync(join(HOOKS_DIR, hookFile), join(hooksDestDir, hookFile));
  }

  // 4. Write VERSION file
  const dfMetaDir = join(configDir, "dark-factory");
  mkdirSync(dfMetaDir, { recursive: true });
  writeFileSync(join(dfMetaDir, "VERSION"), VERSION + "\n");

  // 5. Register hooks and statusline in settings.json
  registerHooks(configDir);

  // 6. Clear update cache (if updating)
  const cachePath = join(configDir, "cache", "df-update-check.json");
  if (isUpdate && existsSync(cachePath)) {
    writeFileSync(cachePath, JSON.stringify({ update_available: false }));
  }

  // Report
  const totalCopied = [...cmdResult.copied, ...dfResult.copied];
  const totalSkipped = [...cmdResult.skipped, ...dfResult.skipped];
  const action = isUpdate ? "Updated" : "Installed";

  console.log(`\n  Dark Factory v${VERSION}\n`);
  console.log(`  ${action} ${totalCopied.length} files to ${relative(process.cwd(), configDir) || configDir}\n`);

  if (totalSkipped.length > 0) {
    console.log(`  Preserved (user state):`);
    for (const f of totalSkipped) {
      console.log(`    - ${f}`);
    }
    console.log();
  }

  console.log(`  Commands available:`);
  console.log(`    /df:map-codebase  Full pipeline (discover + recruit + analyze + verify)`);
  console.log(`    /df:discover      Identify components and write cross-component docs`);
  console.log(`    /df:recruit       Score agents and build the agent registry`);
  console.log(`    /df:analyze       Deep-dive components with specialist agents`);
  console.log(`    /df:update        Update Dark Factory from within Claude Code`);
  console.log();

  if (!isUpdate) {
    console.log(`  Get started: run /df:map-codebase in Claude Code\n`);
  }
}

// ---------------------------------------------------------------------------
// Scope resolution
// ---------------------------------------------------------------------------

function parseScope(args) {
  if (args.includes("--local")) return "local";
  if (args.includes("--global")) return "global";
  return null;
}

function resolveConfigDir(scope) {
  if (scope === "local") return join(process.cwd(), ".claude");
  if (scope === "global") return join(homedir(), ".claude");
  return null;
}

function detectInstalledScope() {
  const localVersion = join(process.cwd(), ".claude", "dark-factory", "VERSION");
  const globalVersion = join(homedir(), ".claude", "dark-factory", "VERSION");
  if (existsSync(localVersion)) return "local";
  if (existsSync(globalVersion)) return "global";
  return null;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdInit(args) {
  let scope = parseScope(args);

  if (!scope) {
    console.log(`
  Usage:
    dark-factory init --local     Install into this project (.claude/)
    dark-factory init --global    Install for all projects (~/.claude/)
`);
    process.exit(1);
  }

  const configDir = resolveConfigDir(scope);
  console.log(`  Installing ${scope === "local" ? "locally" : "globally"}...`);
  install(configDir);
}

function cmdUpdate(args) {
  let scope = parseScope(args) || detectInstalledScope();

  if (!scope) {
    console.log("\n  Dark Factory is not installed. Run 'dark-factory init --local' or 'dark-factory init --global' first.\n");
    process.exit(1);
  }

  const configDir = resolveConfigDir(scope);
  console.log(`  Updating ${scope} installation...`);
  install(configDir, { isUpdate: true });
}

function cmdHelp() {
  console.log(`
  Dark Factory v${VERSION}
  Map any codebase with specialist AI agents.

  Usage:
    dark-factory init --local     Install into this project (.claude/)
    dark-factory init --global    Install for all projects (~/.claude/)
    dark-factory update           Update existing installation
    dark-factory update --local   Update project installation specifically
    dark-factory update --global  Update global installation specifically
    dark-factory help             Show this message

  After install, use these commands in Claude Code:
    /df:map-codebase      Full pipeline
    /df:discover          Component discovery
    /df:recruit           Agent recruitment
    /df:analyze           Component deep-dive
    /df:update            Update Dark Factory
`);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function run(args) {
  const command = args[0];

  switch (command) {
    case "init":
      cmdInit(args.slice(1));
      break;
    case "update":
      cmdUpdate(args.slice(1));
      break;
    case "help":
    case "--help":
    case "-h":
      cmdHelp();
      break;
    case undefined:
      cmdHelp();
      break;
    default:
      console.log(`\n  Unknown command: ${command}\n`);
      cmdHelp();
      process.exit(1);
  }
}
