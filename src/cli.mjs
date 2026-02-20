import {
  existsSync,
  mkdirSync,
  rmSync,
  cpSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, "..");
const HOOKS_DIR = join(PKG_ROOT, "hooks");
const VERSION = JSON.parse(
  readFileSync(join(PKG_ROOT, "package.json"), "utf8"),
).version;

// Canonical placeholder in source markdown files — rewritten at install time
const PATH_PLACEHOLDER = "~/.claude/";

// Hook files owned by Dark Factory
const DF_HOOK_FILES = ["df-check-update.js", "df-statusline.js"];

// Previous hook patterns for cleanup (extend as versions evolve)
const ORPHANED_HOOK_PATTERNS = [];

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

function parseArgs(args) {
  const result = {
    scope: null,
    configDir: null,
    forceStatusline: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--local":
        result.scope = "local";
        break;
      case "--global":
        result.scope = "global";
        break;
      case "--force-statusline":
        result.forceStatusline = true;
        break;
      case "--config-dir":
      case "-c":
        result.configDir = expandTilde(args[++i]);
        break;
    }
  }

  return result;
}

function expandTilde(p) {
  if (!p) return p;
  if (p === "~" || p.startsWith("~/")) {
    return join(homedir(), p.slice(1));
  }
  return p;
}

// ---------------------------------------------------------------------------
// File copying with path rewriting
// ---------------------------------------------------------------------------

function copyTreeWithRewrite(src, dest, pathPrefix) {
  // Clean destination first (prevents orphaned files from previous versions)
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true });
  }

  const copied = [];

  function walk(srcDir, destDir) {
    for (const entry of readdirSync(srcDir)) {
      const srcPath = join(srcDir, entry);
      const destPath = join(destDir, entry);
      const relPath = relative(dest, destPath);

      if (statSync(srcPath).isDirectory()) {
        walk(srcPath, destPath);
      } else {
        mkdirSync(dirname(destPath), { recursive: true });

        if (entry.endsWith(".md")) {
          // Rewrite paths in markdown files
          let content = readFileSync(srcPath, "utf8");
          content = content.replaceAll(PATH_PLACEHOLDER, pathPrefix);
          writeFileSync(destPath, content);
        } else {
          cpSync(srcPath, destPath);
        }

        copied.push(relPath);
      }
    }
  }

  walk(src, dest);
  return copied;
}

// ---------------------------------------------------------------------------
// Post-copy verification
// ---------------------------------------------------------------------------

function verifyInstalled(dirPath, description) {
  if (!existsSync(dirPath)) {
    return `${description}: directory missing (${dirPath})`;
  }
  try {
    const entries = readdirSync(dirPath);
    if (entries.length === 0) {
      return `${description}: directory empty (${dirPath})`;
    }
  } catch {
    return `${description}: could not read directory (${dirPath})`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// File manifest + local patch backup
// ---------------------------------------------------------------------------

function fileHash(filePath) {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

function generateManifest(baseDir) {
  const manifest = {};

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else {
        const relPath = relative(baseDir, fullPath);
        manifest[relPath] = fileHash(fullPath);
      }
    }
  }

  if (existsSync(baseDir)) walk(baseDir);
  return manifest;
}

function writeManifest(configDir) {
  const manifest = {};

  // Hash all installed DF files
  const dirsToHash = [
    join(configDir, "commands", "df"),
    join(configDir, "df"),
  ];

  for (const dir of dirsToHash) {
    if (!existsSync(dir)) continue;
    const sub = generateManifest(dir);
    const prefix = relative(configDir, dir);
    for (const [rel, hash] of Object.entries(sub)) {
      manifest[join(prefix, rel)] = hash;
    }
  }

  // Hash hook files
  for (const hookFile of DF_HOOK_FILES) {
    const hookPath = join(configDir, "hooks", hookFile);
    if (existsSync(hookPath)) {
      manifest[join("hooks", hookFile)] = fileHash(hookPath);
    }
  }

  writeFileSync(
    join(configDir, "df-file-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  return manifest;
}

function saveLocalPatches(configDir) {
  const manifestPath = join(configDir, "df-file-manifest.json");
  if (!existsSync(manifestPath)) return [];

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    return [];
  }

  const modified = [];
  for (const [relPath, expectedHash] of Object.entries(manifest)) {
    const fullPath = join(configDir, relPath);
    if (!existsSync(fullPath)) continue;

    const currentHash = fileHash(fullPath);
    if (currentHash !== expectedHash) {
      modified.push(relPath);
    }
  }

  if (modified.length === 0) return [];

  // Back up modified files
  const patchDir = join(configDir, "df-local-patches");
  if (existsSync(patchDir)) {
    rmSync(patchDir, { recursive: true });
  }
  mkdirSync(patchDir, { recursive: true });

  const backupMeta = {
    backed_up_at: new Date().toISOString(),
    previous_version: VERSION,
    files: [],
  };

  for (const relPath of modified) {
    const src = join(configDir, relPath);
    const dest = join(patchDir, relPath);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
    backupMeta.files.push(relPath);
  }

  writeFileSync(
    join(patchDir, "backup-meta.json"),
    JSON.stringify(backupMeta, null, 2) + "\n",
  );

  return modified;
}

function reportLocalPatches(configDir) {
  const patchDir = join(configDir, "df-local-patches");
  const metaPath = join(patchDir, "backup-meta.json");
  if (!existsSync(metaPath)) return;

  try {
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    if (meta.files && meta.files.length > 0) {
      console.log(`  Local modifications backed up to df-local-patches/:`);
      for (const f of meta.files) {
        console.log(`    - ${f}`);
      }
      console.log();
    }
  } catch {
    // Ignore
  }
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

function cleanupOrphanedHooks(settings) {
  if (!settings.hooks) return;

  for (const [event, hooks] of Object.entries(settings.hooks)) {
    if (!Array.isArray(hooks)) continue;
    settings.hooks[event] = hooks.filter((h) => {
      const cmd = h.command || (h.hooks && h.hooks[0]?.command) || "";
      return !ORPHANED_HOOK_PATTERNS.some((pat) => cmd.includes(pat));
    });
  }
}

function registerHooks(configDir, { forceStatusline = false } = {}) {
  const settings = readSettings(configDir);

  // Ensure hooks structure exists
  if (!settings.hooks) settings.hooks = {};
  if (!Array.isArray(settings.hooks.SessionStart))
    settings.hooks.SessionStart = [];

  // Clean up orphaned hooks from previous versions
  cleanupOrphanedHooks(settings);

  // Remove any existing DF hooks (clean reinstall)
  // Handle both old format ({type, command}) and new format ({matcher, hooks})
  settings.hooks.SessionStart = settings.hooks.SessionStart.filter((h) => {
    const cmd = h.command || (h.hooks && h.hooks[0]?.command) || "";
    return !cmd.includes("df-check-update");
  });

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

  // Register statusline (force overwrites existing)
  if (forceStatusline || !settings.statusLine) {
    settings.statusLine = {
      type: "command",
      command: hookCommand(configDir, "df-statusline.js"),
    };
  }

  writeSettings(configDir, settings);
}

function cleanSettingsOnUninstall(configDir) {
  const settings = readSettings(configDir);
  let changed = false;

  // Remove DF hooks
  if (settings.hooks) {
    for (const [event, hooks] of Object.entries(settings.hooks)) {
      if (!Array.isArray(hooks)) continue;
      const filtered = hooks.filter((h) => {
        const cmd = h.command || (h.hooks && h.hooks[0]?.command) || "";
        return !cmd.includes("df-check-update") && !cmd.includes("df-statusline");
      });
      if (filtered.length !== hooks.length) {
        settings.hooks[event] = filtered;
        changed = true;
      }
      // Remove empty event arrays
      if (settings.hooks[event].length === 0) {
        delete settings.hooks[event];
        changed = true;
      }
    }
    // Remove empty hooks object
    if (Object.keys(settings.hooks).length === 0) {
      delete settings.hooks;
      changed = true;
    }
  }

  // Remove DF statusline
  if (settings.statusLine) {
    const cmd =
      settings.statusLine.command || "";
    if (cmd.includes("df-statusline")) {
      delete settings.statusLine;
      changed = true;
    }
  }

  if (changed) {
    if (Object.keys(settings).length === 0) {
      // Don't leave an empty settings file — but don't delete either,
      // other tools may expect it to exist
      writeSettings(configDir, {});
    } else {
      writeSettings(configDir, settings);
    }
  }
}

// ---------------------------------------------------------------------------
// Install / Update
// ---------------------------------------------------------------------------

function install(configDir, { isUpdate = false, forceStatusline = false, pathPrefix } = {}) {
  mkdirSync(configDir, { recursive: true });

  // Path prefix for markdown rewriting
  // Callers pass "./.claude/" for local, or omit for absolute path
  if (!pathPrefix) {
    pathPrefix = configDir.endsWith("/") ? configDir : configDir + "/";
  }

  // Save local patches before overwriting (only on update with existing manifest)
  if (isUpdate) {
    saveLocalPatches(configDir);
  }

  // 1. Copy command files (only commands/df/ — don't touch other commands)
  const cmdCopied = copyTreeWithRewrite(
    join(PKG_ROOT, "commands", "df"),
    join(configDir, "commands", "df"),
    pathPrefix,
  );

  // 2. Copy df internals
  const dfCopied = copyTreeWithRewrite(
    join(PKG_ROOT, "df"),
    join(configDir, "df"),
    pathPrefix,
  );

  // 3. Copy hooks
  const hooksDestDir = join(configDir, "hooks");
  mkdirSync(hooksDestDir, { recursive: true });
  const hooksCopied = [];
  for (const hookFile of DF_HOOK_FILES) {
    const src = join(HOOKS_DIR, hookFile);
    if (existsSync(src)) {
      cpSync(src, join(hooksDestDir, hookFile));
      hooksCopied.push(hookFile);
    }
  }

  // 4. Write VERSION file
  const dfMetaDir = join(configDir, "dark-factory");
  mkdirSync(dfMetaDir, { recursive: true });
  writeFileSync(join(dfMetaDir, "VERSION"), VERSION + "\n");

  // 5. Copy CHANGELOG.md if it exists
  const changelogSrc = join(PKG_ROOT, "CHANGELOG.md");
  if (existsSync(changelogSrc)) {
    cpSync(changelogSrc, join(dfMetaDir, "CHANGELOG.md"));
  }

  // 6. Write CommonJS package.json shim (prevents ESM project inheritance)
  const pkgJsonPath = join(configDir, "package.json");
  writeFileSync(pkgJsonPath, '{"type":"commonjs"}\n');

  // 7. Register hooks and statusline in settings.json
  registerHooks(configDir, { forceStatusline });

  // 8. Clear update cache (if updating)
  const cachePath = join(configDir, "cache", "df-update-check.json");
  if (isUpdate && existsSync(cachePath)) {
    writeFileSync(cachePath, JSON.stringify({ update_available: false }));
  }

  // 9. Post-copy verification
  const failures = [];
  for (const [dir, desc] of [
    [join(configDir, "commands", "df"), "Commands"],
    [join(configDir, "df"), "DF internals"],
    [join(configDir, "hooks"), "Hooks"],
  ]) {
    const err = verifyInstalled(dir, desc);
    if (err) failures.push(err);
  }

  if (failures.length > 0) {
    console.error("\n  Installation verification failed:\n");
    for (const f of failures) {
      console.error(`    - ${f}`);
    }
    console.error();
    process.exit(1);
  }

  // 10. Write file manifest (for patch detection on next update)
  writeManifest(configDir);

  // Report
  const totalCopied = cmdCopied.length + dfCopied.length + hooksCopied.length;
  const action = isUpdate ? "Updated" : "Installed";

  console.log(`\n  Dark Factory v${VERSION}\n`);
  console.log(
    `  ${action} ${totalCopied} files to ${relative(process.cwd(), configDir) || configDir}\n`,
  );

  // Report backed-up patches (if any)
  if (isUpdate) {
    reportLocalPatches(configDir);
  }

  console.log(`  Commands available:`);
  console.log(
    `    /df:new           Capture a thought, explore code, shape an approach`,
  );
  console.log(
    `    /df:list          Show all work items at all levels`,
  );
  console.log(
    `    /df:map-codebase  Full pipeline (discover + recruit + analyze + verify)`,
  );
  console.log(
    `    /df:discover      Identify components and write cross-component docs`,
  );
  console.log(
    `    /df:recruit       Score agents and build the agent registry`,
  );
  console.log(
    `    /df:analyze       Deep-dive components with specialist agents`,
  );
  console.log(
    `    /df:update        Update Dark Factory from within Claude Code`,
  );
  console.log();

  if (!isUpdate) {
    console.log(`  Get started: run /df:map-codebase in Claude Code\n`);
  }
}

// ---------------------------------------------------------------------------
// Uninstall
// ---------------------------------------------------------------------------

function uninstall(configDir) {
  const removed = [];

  // Remove DF directories
  for (const dir of ["commands/df", "df", "dark-factory"]) {
    const target = join(configDir, dir);
    if (existsSync(target)) {
      rmSync(target, { recursive: true });
      removed.push(dir + "/");
    }
  }

  // Remove DF hook files
  for (const hookFile of DF_HOOK_FILES) {
    const target = join(configDir, "hooks", hookFile);
    if (existsSync(target)) {
      rmSync(target);
      removed.push("hooks/" + hookFile);
    }
  }

  // Remove CJS package.json only if it matches exactly what we wrote
  const pkgJsonPath = join(configDir, "package.json");
  if (existsSync(pkgJsonPath)) {
    try {
      const content = readFileSync(pkgJsonPath, "utf8");
      if (content.trim() === '{"type":"commonjs"}') {
        rmSync(pkgJsonPath);
        removed.push("package.json");
      }
    } catch {
      // Leave it
    }
  }

  // Remove manifest and patches
  const manifestPath = join(configDir, "df-file-manifest.json");
  if (existsSync(manifestPath)) {
    rmSync(manifestPath);
    removed.push("df-file-manifest.json");
  }

  const patchDir = join(configDir, "df-local-patches");
  if (existsSync(patchDir)) {
    rmSync(patchDir, { recursive: true });
    removed.push("df-local-patches/");
  }

  // Clean DF entries from settings.json
  cleanSettingsOnUninstall(configDir);

  // Report
  console.log(`\n  Dark Factory v${VERSION} — Uninstalled\n`);

  if (removed.length > 0) {
    console.log(`  Removed from ${relative(process.cwd(), configDir) || configDir}:`);
    for (const f of removed) {
      console.log(`    - ${f}`);
    }
    console.log();
  } else {
    console.log(`  Nothing to remove (Dark Factory was not installed here).\n`);
  }

  // Remind about user data we intentionally preserve
  const darkFactoryOutput = join(process.cwd(), ".dark-factory");
  const dfAgents = join(process.cwd(), ".claude", "agents");
  const reminders = [];

  if (existsSync(darkFactoryOutput)) {
    reminders.push(`.dark-factory/  (generated docs — delete manually if unwanted)`);
  }
  if (existsSync(dfAgents)) {
    // Check if any df-* agents exist
    try {
      const agents = readdirSync(dfAgents).filter((f) => f.startsWith("df-"));
      if (agents.length > 0) {
        reminders.push(
          `.claude/agents/df-*.md  (${agents.length} agent(s) — delete manually if unwanted)`,
        );
      }
    } catch {
      // Ignore
    }
  }

  if (reminders.length > 0) {
    console.log(`  Preserved (user data):`);
    for (const r of reminders) {
      console.log(`    - ${r}`);
    }
    console.log();
  }
}

// ---------------------------------------------------------------------------
// Scope resolution
// ---------------------------------------------------------------------------

function resolveConfigDir(scope, overrideDir) {
  // Explicit --config-dir takes priority
  if (overrideDir) return resolve(overrideDir);

  if (scope === "local") return join(process.cwd(), ".claude");

  if (scope === "global") {
    // CLAUDE_CONFIG_DIR env var takes priority over default
    const envDir = process.env.CLAUDE_CONFIG_DIR;
    if (envDir) return resolve(expandTilde(envDir));
    return join(homedir(), ".claude");
  }

  return null;
}

function detectInstalledScope() {
  const localVersion = join(
    process.cwd(),
    ".claude",
    "dark-factory",
    "VERSION",
  );
  if (existsSync(localVersion)) return "local";

  // Check CLAUDE_CONFIG_DIR if set
  const envDir = process.env.CLAUDE_CONFIG_DIR;
  if (envDir) {
    const envVersion = join(
      resolve(expandTilde(envDir)),
      "dark-factory",
      "VERSION",
    );
    if (existsSync(envVersion)) return "global";
  }

  const globalVersion = join(homedir(), ".claude", "dark-factory", "VERSION");
  if (existsSync(globalVersion)) return "global";

  return null;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdInit(args) {
  const parsed = parseArgs(args);
  let scope = parsed.scope;
  const configDir = parsed.configDir;

  if (!scope && !configDir) {
    // Non-interactive terminal fallback
    if (!process.stdin.isTTY) {
      scope = "global";
      console.log(
        `  No --local/--global flag and non-interactive terminal detected. Defaulting to global install.`,
      );
    } else {
      console.log(`
  Usage:
    dark-factory init --local     Install into this project (.claude/)
    dark-factory init --global    Install for all projects (~/.claude/)
    dark-factory init -c <path>   Install into a custom config directory
`);
      process.exit(1);
    }
  }

  const dir = configDir || resolveConfigDir(scope);
  const label = configDir
    ? dir
    : scope === "local"
      ? "locally"
      : "globally";
  console.log(`  Installing ${label}...`);
  install(dir, {
    forceStatusline: parsed.forceStatusline,
    pathPrefix: scope === "local" ? "./.claude/" : undefined,
  });
}

function cmdUpdate(args) {
  const parsed = parseArgs(args);
  let scope = parsed.scope || detectInstalledScope();
  const configDir = parsed.configDir;

  if (!scope && !configDir) {
    console.log(
      "\n  Dark Factory is not installed. Run 'dark-factory init --local' or 'dark-factory init --global' first.\n",
    );
    process.exit(1);
  }

  const dir = configDir || resolveConfigDir(scope);
  const label = configDir ? dir : `${scope}`;
  console.log(`  Updating ${label} installation...`);
  install(dir, {
    isUpdate: true,
    forceStatusline: parsed.forceStatusline,
    pathPrefix: scope === "local" ? "./.claude/" : undefined,
  });
}

function cmdUninstall(args) {
  const parsed = parseArgs(args);
  let scope = parsed.scope || detectInstalledScope();
  const configDir = parsed.configDir;

  if (!scope && !configDir) {
    console.log(
      "\n  Dark Factory is not installed. Nothing to uninstall.\n",
    );
    process.exit(1);
  }

  const dir = configDir || resolveConfigDir(scope);
  uninstall(dir);
}

function cmdHelp() {
  console.log(`
  Dark Factory v${VERSION}
  Map any codebase with specialist AI agents.

  Usage:
    dark-factory init --local        Install into this project (.claude/)
    dark-factory init --global       Install for all projects (~/.claude/)
    dark-factory init -c <path>      Install into a custom config directory
    dark-factory update              Update existing installation
    dark-factory update --local      Update project installation specifically
    dark-factory update --global     Update global installation specifically
    dark-factory uninstall           Uninstall from detected location
    dark-factory uninstall --local   Uninstall from this project
    dark-factory uninstall --global  Uninstall from global config
    dark-factory help                Show this message

  Flags:
    --config-dir, -c <path>   Override config directory
    --force-statusline        Overwrite existing statusline registration

  Environment:
    CLAUDE_CONFIG_DIR         Override global config directory (~/.claude/)

  After install, use these commands in Claude Code:
    /df:new               Capture, explore, shape work items
    /df:list              Show all work items
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
    case "uninstall":
      cmdUninstall(args.slice(1));
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
