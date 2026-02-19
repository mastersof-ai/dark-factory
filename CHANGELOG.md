# Changelog

All notable changes to Dark Factory will be documented in this file.

## [Unreleased]

### Added
- **Uninstall command**: `dark-factory uninstall` cleanly removes all DF files, hooks, and settings
- **`CLAUDE_CONFIG_DIR` env var**: Override the global config directory for non-standard setups
- **`--config-dir` / `-c` flag**: Install to any arbitrary directory
- **`--force-statusline` flag**: Overwrite existing statusline registration from other tools
- **Install-time path rewriting**: Markdown files get correct absolute/relative paths for global/local installs
- **CommonJS package.json shim**: Prevents CJS hooks from breaking in ESM projects
- **Clean destination on copy**: Eliminates orphaned files from previous versions
- **Post-copy verification**: Install fails fast if files weren't written correctly
- **File manifest** (`df-file-manifest.json`): SHA256 hashes of installed files for patch detection
- **Local patch backup**: Modified files are backed up to `df-local-patches/` before updates
- **Non-interactive fallback**: Defaults to global install when stdin is not a TTY
- **Orphaned hook cleanup infrastructure**: Framework for removing hooks from previous DF versions
- **Changelog**: Displayed during `/df:update` before confirming the update

### Changed
- Source markdown files now use `~/.claude/` as canonical placeholder (rewritten at install time)
- Hooks respect `CLAUDE_CONFIG_DIR` when locating VERSION and cache files
- `copyTree` replaced by `copyTreeWithRewrite` (clean copy + path rewriting)
- Only DF-owned hook files are copied (no longer copies arbitrary files from hooks/)

### Fixed
- Global installs now get correct absolute paths in `@` includes and template references
- CJS hooks no longer fail when the project has `"type": "module"` in package.json

## [0.1.0] - 2025-02-14

### Added
- Initial release
- 4-phase pipeline: discover, recruit, analyze, verify
- Agent scoring rubric (4 dimensions, 0-10 scale)
- Background update check with statusline indicator
- Local and global install modes
