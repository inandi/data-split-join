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
