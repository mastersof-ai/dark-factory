import { existsSync, mkdirSync, cpSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILES_DIR = join(__dirname, "..", "files");
const VERSION = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8"),
).version;

const PRESERVED_FILES = new Set(["df/registry.md"]);

function copyTree(src, dest, { dryRun = false, preserveExisting = false } = {}) {
  const copied = [];
  const skipped = [];

  function walk(srcDir, destDir) {
    for (const entry of readdirSync(srcDir)) {
      const srcPath = join(srcDir, entry);
      const destPath = join(destDir, entry);
      const relPath = relative(dest, destPath);

      if (statSync(srcPath).isDirectory()) {
        if (!dryRun && !existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        walk(srcPath, destPath);
      } else {
        const shouldPreserve =
          preserveExisting && existsSync(destPath) && PRESERVED_FILES.has(relPath);

        if (shouldPreserve) {
          skipped.push(relPath);
        } else {
          if (!dryRun) {
            mkdirSync(dirname(destPath), { recursive: true });
            cpSync(srcPath, destPath);
          }
          copied.push(relPath);
        }
      }
    }
  }

  walk(src, dest);
  return { copied, skipped };
}

function init(cwd) {
  const claudeDir = join(cwd, ".claude");

  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  // Copy commands
  const commandsSrc = join(FILES_DIR, "commands");
  const commandsDest = join(claudeDir, "commands");
  const cmdResult = copyTree(commandsSrc, commandsDest);

  // Copy df internals (preserve registry if it exists)
  const dfSrc = join(FILES_DIR, "df");
  const dfDest = join(claudeDir, "df");
  const dfResult = copyTree(dfSrc, dfDest, { preserveExisting: true });

  const totalCopied = [...cmdResult.copied, ...dfResult.copied];
  const totalSkipped = [...cmdResult.skipped, ...dfResult.skipped];

  console.log(`\n  Dark Factory v${VERSION}\n`);
  console.log(`  Installed ${totalCopied.length} files to .claude/\n`);

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
  console.log();
  console.log(`  Get started: run /df:map-codebase in Claude Code\n`);
}

function update(cwd) {
  const claudeDir = join(cwd, ".claude");

  if (!existsSync(join(claudeDir, "commands", "df"))) {
    console.log("\n  Dark Factory is not installed. Run 'dark-factory init' first.\n");
    process.exit(1);
  }

  // Same as init but always preserves user state
  const commandsSrc = join(FILES_DIR, "commands");
  const commandsDest = join(claudeDir, "commands");
  const cmdResult = copyTree(commandsSrc, commandsDest);

  const dfSrc = join(FILES_DIR, "df");
  const dfDest = join(claudeDir, "df");
  const dfResult = copyTree(dfSrc, dfDest, { preserveExisting: true });

  const totalCopied = [...cmdResult.copied, ...dfResult.copied];
  const totalSkipped = [...cmdResult.skipped, ...dfResult.skipped];

  console.log(`\n  Dark Factory v${VERSION} - updated\n`);
  console.log(`  Updated ${totalCopied.length} files\n`);

  if (totalSkipped.length > 0) {
    console.log(`  Preserved (user state):`);
    for (const f of totalSkipped) {
      console.log(`    - ${f}`);
    }
    console.log();
  }
}

function help() {
  console.log(`
  Dark Factory v${VERSION}
  Map any codebase with specialist AI agents.

  Usage:
    dark-factory init     Install Dark Factory into the current project
    dark-factory update   Update to latest skills and templates (preserves registry)
    dark-factory help     Show this message

  After install, use these commands in Claude Code:
    /df:map-codebase      Full pipeline
    /df:discover          Component discovery
    /df:recruit           Agent recruitment
    /df:analyze           Component deep-dive
`);
}

export function run(args) {
  const command = args[0];
  const cwd = process.cwd();

  switch (command) {
    case "init":
      init(cwd);
      break;
    case "update":
      update(cwd);
      break;
    case "help":
    case "--help":
    case "-h":
      help();
      break;
    case undefined:
      help();
      break;
    default:
      console.log(`\n  Unknown command: ${command}\n`);
      help();
      process.exit(1);
  }
}
