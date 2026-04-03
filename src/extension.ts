/**
 * QuickList Format Extension Main Module
 *
 * VS Code extension for formatting selected editor text into common list shapes
 * (comma/semicolon/newline), applying quote modes, and running reusable custom
 * templates saved in workspace/global scope.
 *
 * @author Gobinda Nandi <gobinda.nandi.public@gmail.com>
 * @since 1.0.0 [03-04-2026]
 * @version 1.0.0
 * @copyright (c) 2026 Gobinda Nandi
 */

import * as vscode from "vscode";
import { getBuiltInTemplate, BUILT_IN_TEMPLATES } from "./templates/defaults";
import { formatText, FormatTemplate } from "./transform/engine";
import {
  deleteTemplate,
  getScopedTemplates,
  saveTemplate,
  ScopedTemplate,
  TemplateScope
} from "./templates/store";

/**
 * Activates the extension and wires all context-menu and command-palette actions.
 */
export function activate(context: vscode.ExtensionContext): void {
  registerTemplateCommand(context, "quickListFormat.joinComma", "joinComma");
  registerTemplateCommand(context, "quickListFormat.joinSemicolon", "joinSemicolon");
  registerTemplateCommand(
    context,
    "quickListFormat.joinSingleQuotedComma",
    "joinSingleQuotedComma"
  );
  registerTemplateCommand(
    context,
    "quickListFormat.joinDoubleQuotedSemicolon",
    "joinDoubleQuotedSemicolon"
  );
  registerTemplateCommand(context, "quickListFormat.splitToLines", "splitToLines");

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "quickListFormat.addPrefixSuffix",
      async () => runAddPrefixSuffix()
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "quickListFormat.applyCustomTemplate",
      async () => runCustomTemplatePicker()
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("quickListFormat.manageTemplates", async () =>
      runTemplateManager()
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("quickListFormat.run", async () => runGenericPicker())
  );
}

/**
 * Deactivate hook. No explicit cleanup is required.
 */
export function deactivate(): void {
  // Nothing to cleanup.
}

/**
 * Registers a command that applies one built-in template to selected text.
 */
function registerTemplateCommand(
  context: vscode.ExtensionContext,
  commandId: string,
  templateId:
    | "joinComma"
    | "joinSemicolon"
    | "joinSingleQuotedComma"
    | "joinDoubleQuotedSemicolon"
    | "splitToLines"
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(commandId, async () => {
      const template = getBuiltInTemplate(templateId);
      await applyTemplateToActiveSelections(template);
    })
  );
}

/**
 * Interactive flow for the "Add Prefix/Suffix" formatter.
 * Prompts for prefix/suffix and delimiter, then applies to active selections.
 */
async function runAddPrefixSuffix(): Promise<void> {
  const prefix = await vscode.window.showInputBox({
    prompt: "Enter item prefix (optional)",
    placeHolder: "e.g. file-",
    value: ""
  });
  if (prefix === undefined) {
    return;
  }

  const suffix = await vscode.window.showInputBox({
    prompt: "Enter item suffix (optional)",
    placeHolder: "e.g. -id",
    value: ""
  });
  if (suffix === undefined) {
    return;
  }

  const delimiter = await vscode.window.showQuickPick(
    [
      { label: "Comma (,)", value: "," },
      { label: "Semicolon (;)", value: ";" },
      { label: "New Line", value: "\n" }
    ],
    { placeHolder: "Choose output delimiter" }
  );
  if (!delimiter) {
    return;
  }

  const template: FormatTemplate = {
    ...getBuiltInTemplate("joinComma"),
    name: "Add Prefix/Suffix",
    output: {
      ...getBuiltInTemplate("joinComma").output,
      delimiter: delimiter.value,
      prefix,
      suffix
    }
  };

  await applyTemplateToActiveSelections(template);
}

/**
 * Lets the user pick an existing custom template and apply it.
 */
async function runCustomTemplatePicker(): Promise<void> {
  const templates = await getScopedTemplates();
  if (templates.length === 0) {
    void vscode.window.showInformationMessage(
      "No custom templates found. Use 'Manage Templates...' to create one."
    );
    return;
  }

  const picked = await vscode.window.showQuickPick(
    templates.map((item) => ({
      label: item.template.name,
      description: item.scope === "workspace" ? "Project" : "Global",
      template: item.template
    })),
    { placeHolder: "Choose a custom template" }
  );

  if (!picked) {
    return;
  }

  await applyTemplateToActiveSelections(picked.template);
}

/**
 * Opens a unified picker containing built-in and custom templates.
 */
async function runGenericPicker(): Promise<void> {
  const custom = await getScopedTemplates();
  const builtInEntries = BUILT_IN_TEMPLATES.map((item) => ({
    label: item.template.name,
    description: "Built-in",
    template: item.template
  }));
  const customEntries = custom.map((item) => ({
    label: item.template.name,
    description: item.scope === "workspace" ? "Custom (Project)" : "Custom (Global)",
    template: item.template
  }));

  const picked = await vscode.window.showQuickPick(
    [...builtInEntries, ...customEntries],
    { placeHolder: "Run formatter template" }
  );

  if (!picked) {
    return;
  }

  await applyTemplateToActiveSelections(picked.template);
}

/**
 * Entry point for custom template management actions.
 */
async function runTemplateManager(): Promise<void> {
  const action = await vscode.window.showQuickPick(
    [
      { label: "Create Template", value: "create" },
      { label: "Edit Template", value: "edit" },
      { label: "Delete Template", value: "delete" }
    ],
    { placeHolder: "Manage custom templates" }
  );

  if (!action) {
    return;
  }

  if (action.value === "create") {
    await createTemplate();
    return;
  }

  if (action.value === "edit") {
    await editTemplate();
    return;
  }

  await removeTemplate();
}

/**
 * Creates a template from prompt inputs and saves it to chosen scope.
 */
async function createTemplate(): Promise<void> {
  const template = await promptTemplateFields();
  if (!template) {
    return;
  }

  const scope = await promptScope();
  if (!scope) {
    return;
  }

  await saveTemplate(template, scope);
  void vscode.window.showInformationMessage(
    `Template '${template.name}' saved in ${scope === "workspace" ? "project" : "global"} scope.`
  );
}

/**
 * Edits an existing template in-place (including optional rename).
 */
async function editTemplate(): Promise<void> {
  const selected = await pickScopedTemplate("Select a template to edit");
  if (!selected) {
    return;
  }

  const edited = await promptTemplateFields(selected.template);
  if (!edited) {
    return;
  }

  if (edited.name !== selected.template.name) {
    await deleteTemplate(selected.template.name, selected.scope);
  }

  await saveTemplate(edited, selected.scope);
  void vscode.window.showInformationMessage(`Template '${edited.name}' updated.`);
}

/**
 * Deletes a template after explicit confirmation.
 */
async function removeTemplate(): Promise<void> {
  const selected = await pickScopedTemplate("Select a template to delete");
  if (!selected) {
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Delete template '${selected.template.name}' from ${selected.scope} scope?`,
    { modal: true },
    "Delete"
  );
  if (confirm !== "Delete") {
    return;
  }

  await deleteTemplate(selected.template.name, selected.scope);
  void vscode.window.showInformationMessage(`Template '${selected.template.name}' deleted.`);
}

/**
 * Prompts user to choose one template from available custom templates.
 */
async function pickScopedTemplate(
  placeholder: string
): Promise<ScopedTemplate | undefined> {
  const templates = await getScopedTemplates();
  if (templates.length === 0) {
    void vscode.window.showInformationMessage("No custom templates found.");
    return undefined;
  }

  const picked = await vscode.window.showQuickPick(
    templates.map((item) => ({
      label: item.template.name,
      description: item.scope === "workspace" ? "Project" : "Global",
      item
    })),
    { placeHolder: placeholder }
  );

  return picked?.item;
}

/**
 * Prompts for the destination scope to store templates.
 */
async function promptScope(): Promise<TemplateScope | undefined> {
  const picked = await vscode.window.showQuickPick(
    [
      { label: "Project (Workspace)", value: "workspace" as const },
      { label: "Global (User)", value: "global" as const }
    ],
    { placeHolder: "Choose where to store this template" }
  );
  return picked?.value;
}

/**
 * Wizard-like prompt sequence to collect all template fields.
 * Returns undefined when the user cancels any step.
 */
async function promptTemplateFields(
  initial?: FormatTemplate
): Promise<FormatTemplate | undefined> {
  const name = await vscode.window.showInputBox({
    prompt: "Template name",
    value: initial?.name ?? "",
    validateInput: (value) => (value.trim().length === 0 ? "Name is required." : undefined)
  });
  if (!name) {
    return undefined;
  }

  const inputMode = await vscode.window.showQuickPick(
    [
      { label: "Auto detect", value: "auto" as const },
      { label: "Lines", value: "lines" as const },
      { label: "Delimited", value: "delimited" as const }
    ],
    {
      placeHolder: "Choose input mode"
    }
  );
  if (!inputMode) {
    return undefined;
  }

  const delimiterInput = await vscode.window.showInputBox({
    prompt: "Input delimiters separated by comma (supports \\n and \\t)",
    value: (initial?.split.delimiters ?? [",", ";", "\\n", "\\t"]).join(",")
  });
  if (delimiterInput === undefined) {
    return undefined;
  }

  const outputDelimiter = await vscode.window.showInputBox({
    prompt: "Output delimiter (supports \\n and \\t)",
    value: initial?.output.delimiter ?? ","
  });
  if (outputDelimiter === undefined) {
    return undefined;
  }

  const quoteMode = await vscode.window.showQuickPick(
    [
      { label: "No quote", value: "none" as const },
      { label: "Single quote", value: "single" as const },
      { label: "Double quote", value: "double" as const }
    ],
    { placeHolder: "Quote mode" }
  );
  if (!quoteMode) {
    return undefined;
  }

  const prefix = await vscode.window.showInputBox({
    prompt: "Prefix per item",
    value: initial?.output.prefix ?? ""
  });
  if (prefix === undefined) {
    return undefined;
  }

  const suffix = await vscode.window.showInputBox({
    prompt: "Suffix per item",
    value: initial?.output.suffix ?? ""
  });
  if (suffix === undefined) {
    return undefined;
  }

  const wrapStart = await vscode.window.showInputBox({
    prompt: "Wrap start (optional, e.g. () leading bracket)",
    value: initial?.output.wrapStart ?? ""
  });
  if (wrapStart === undefined) {
    return undefined;
  }

  const wrapEnd = await vscode.window.showInputBox({
    prompt: "Wrap end (optional, e.g. ) closing bracket)",
    value: initial?.output.wrapEnd ?? ""
  });
  if (wrapEnd === undefined) {
    return undefined;
  }

  const trimItems = await yesNo("Trim each item?", initial?.trimItems ?? true);
  if (trimItems === undefined) {
    return undefined;
  }

  const dropEmpty = await yesNo("Remove empty items?", initial?.dropEmpty ?? true);
  if (dropEmpty === undefined) {
    return undefined;
  }

  const dedupe = await yesNo("De-duplicate items?", initial?.dedupe ?? false);
  if (dedupe === undefined) {
    return undefined;
  }

  const sort = await vscode.window.showQuickPick(
    [
      { label: "No sort", value: "none" as const },
      { label: "Sort ascending", value: "asc" as const },
      { label: "Sort descending", value: "desc" as const }
    ],
    { placeHolder: "Sorting mode" }
  );
  if (!sort) {
    return undefined;
  }

  return {
    name: name.trim(),
    inputMode: inputMode.value,
    split: {
      delimiters: parseEscapedDelimiters(delimiterInput)
    },
    trimItems,
    dropEmpty,
    dedupe,
    sort: sort.value,
    output: {
      delimiter: unescapeInputToken(outputDelimiter),
      quote: quoteMode.value,
      prefix,
      suffix,
      wrapStart,
      wrapEnd
    }
  };
}

/**
 * Parses delimiter input that may contain escaped newline/tab markers.
 */
function parseEscapedDelimiters(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => unescapeInputToken(item.trim()))
    .filter((item) => item.length > 0);
}

/**
 * Converts escaped token text (\\n, \\t) into real characters.
 */
function unescapeInputToken(value: string): string {
  return value.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}

/**
 * Standard yes/no picker helper used by template creation prompts.
 */
async function yesNo(prompt: string, initial: boolean): Promise<boolean | undefined> {
  const picked = await vscode.window.showQuickPick(
    [
      { label: "Yes", value: true },
      { label: "No", value: false }
    ],
    {
      placeHolder: prompt
    }
  );
  if (!picked) {
    return undefined;
  }
  if (initial && picked.value === false) {
    return false;
  }
  if (!initial && picked.value === true) {
    return true;
  }
  return picked.value;
}

/**
 * Applies the given template to each non-empty active selection in the editor.
 * Works equally for saved and unsaved files because edits are buffer-based.
 */
async function applyTemplateToActiveSelections(template: FormatTemplate): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    void vscode.window.showInformationMessage("Open a text editor and select text to format.");
    return;
  }

  const nonEmptySelections = editor.selections.filter(
    (selection) => !selection.isEmpty
  );

  if (nonEmptySelections.length === 0) {
    void vscode.window.showInformationMessage("Select text to apply formatting.");
    return;
  }

  await editor.edit((editBuilder) => {
    for (const selection of nonEmptySelections) {
      const text = editor.document.getText(selection);
      const result = formatText(text, template);
      editBuilder.replace(selection, result);
    }
  });
}
