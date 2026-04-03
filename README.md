<div align="center">
  <h1>Data Split-Join [Beta]</h1>
  <p><strong>Context Menu Data Formatter for VS Code</strong></p>
</div>

Need to quickly convert copied values between lines, CSV, quoted strings, or prefixed formats?  
Data Split-Join adds a **Format Data** submenu in the editor right-click menu so you can reformat selected text in one step.

## What is Data Split-Join?

Data Split-Join is a VS Code extension for transforming selected text lists:
- lines -> comma/semicolon separated
- comma/semicolon list -> lines
- unquoted -> single/double quoted
- add prefix/suffix per item
- run reusable custom templates (project/global scope)

It works for both **saved and unsaved files** because it only operates on editor selections.

## Why Use It?

- **Fast context-menu workflow**: Right-click selected text and apply a format
- **Common defaults built in**: No setup required for popular transformations
- **Reusable custom templates**: Save your own transforms in workspace or user scope
- **Multi-selection support**: Apply to each selected block in one command
- **Data cleanup controls**: Trim items, remove empties, de-duplicate, and sort

## Getting Started

### Installation

1. Open VS Code or Cursor
2. Go to the Extensions view
3. Search for **Data Split-Join**
4. Click Install

### First Steps

1. Select some text in an editor, for example:

```txt
1
2
3
```

2. Right-click in the editor and open **Format Data**
3. Choose a built-in formatter like **Join With Comma**
4. Result becomes:

```txt
1,2,3
```

## Default Built-in Actions

- **Join With Comma**: `1\n2\n3` -> `1,2,3`
- **Join With Semicolon**: `1\n2\n3` -> `1;2;3`
- **Join As Single-Quoted CSV**: `1\n2` -> `'1','2'`
- **Join As Double-Quoted Semicolon**: `1\n2` -> `"1";"2"`
- **Split To New Lines**: `1,2,3,4` -> multiline
- **Add Prefix/Suffix...**: e.g. `1,2` -> `file-1,file-2`

## More Useful Combinations

- SQL `IN` helper: `('a','b','c')`
- JSON-like string array: `["a","b","c"]`
- Parenthesized output: `(1),(2),(3)`
- ID/value patterns: `id=1,id=2`
- Markdown bullets or numbered output
- Normalize mixed delimiters (`1, 2; 3\n4`) into one target format

## Commands

- **Data Split-Join: Run Formatter** - Open a picker for built-in and custom templates
- **Manage Templates...** - Create, edit, and delete templates
- **Context menu path** - Right-click editor -> `Format Data`

If no text is selected, the extension prompts you to select text first.

## Custom Templates

Template schema supports:
- `inputMode`: `auto | lines | delimited`
- `split.delimiters`: e.g. `,`, `;`, `\\n`, `\\t`
- `trimItems`, `dropEmpty`, `dedupe`, `sort`
- output `delimiter`, `quote`, `prefix`, `suffix`, `wrapStart`, `wrapEnd`

Store templates in:
- **Project (Workspace)** scope
- **Global (User)** scope

## How It Works

### Input Handling

- **Saved and unsaved files**: Uses current editor buffer selections
- **Input modes**: `auto`, `lines`, `delimited`
- **Delimiter parsing**: Supports comma, semicolon, newline, tab (and custom delimiters)

### Settings

Configure custom templates with:

- `quickListFormat.customTemplates` - Template definitions saved to user or workspace settings target

Press **F5** to launch the Extension Development Host.

## Development

```bash
npm install
npm run compile
npm test
```

Press `F5` in VS Code/Cursor to launch the Extension Development Host.

## Support the Project

If Data Split-Join helps your workflow, you can support the project (no pressure):

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/igobinda)

## Need Help?

- **Issues**: Found a bug or have an idea? Open an issue on GitHub
- **Repository**: [github.com/iNandi/vscode-plugin](https://github.com/iNandi/vscode-plugin)

## License

This project is licensed under the MIT License.

---

**Made with ❤️ by [Gobinda Nandi](mailto:gobinda.nandi.public@gmail.com)**
