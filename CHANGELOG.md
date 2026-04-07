# Release v3.1.1 - 2026-04-07

## New Features
- Enhanced release publishing to support both Visual Studio Marketplace and Open VSX Registry.

## Improvements
- Added release-time validation to ensure the release process checks the extension version against `package.json`.
- Marked the release channel as preview.

## Bug Fixes
- Improved release script error handling for missing marketplace tokens.
- Updated publish-step result reporting to clearly show success or failure for each target.

---

# Release v1.1.0 - 2026-04-03

## Improvements
- Renamed the extension from QuickList Format to **Data Split-Join** across packaging, README, and documentation, with expanded commands and clearer project structure.
- Updated the extension logo asset used for publishing.

## Bug Fixes
- Corrected the repository URL in the README.

---

# Release v1.0.0 - 2026-04-03

## New Features
- Added **Data Split-Join** VS Code extension with right-click editor submenu: `Format Data`.
- Added built-in format actions: comma join, semicolon join, single-quoted join, double-quoted join, split to new lines, and prefix/suffix formatter.
- Added custom template support with create/edit/delete flows and scope-based storage (**Workspace** and **Global**).
- Added command palette entry: `Data Split-Join: Run Formatter` to run built-in/custom templates from one picker.

## Improvements
- Introduced a reusable transform engine (`parse -> normalize -> render`) with support for trim, empty filtering, dedupe, and sorting.
- Added schema normalization for custom templates to safely handle invalid/partial settings entries.
- Improved code maintainability with consistent TypeScript module/function documentation headers across `src`.
- Added concise project documentation in `docs/OVERVIEW.md` with architecture and data-flow diagrams.

---
